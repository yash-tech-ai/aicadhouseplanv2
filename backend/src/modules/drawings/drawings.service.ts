import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StandardDrawing, DrawingStatus } from '@/database/entities/standard-drawing.entity';
import { DrawingCategory } from '@/database/entities/drawing-category.entity';
import { DrawingParameter, ParameterDataType } from '@/database/entities/drawing-parameter.entity';
import { FileStorageService } from './services/file-storage.service';
import { CadService } from '../cad/cad.service';
import { ValidationService } from '../rules/services/validation.service';
import { ImageProcessorService } from '../cad/services/image-processor.service';

export interface CreateDrawingDto {
  name: string;
  description?: string;
  categoryId: string;
  uploaderId: string;
  region?: string;
  state?: string;
  parameters?: Record<string, any>;
  isStandard?: boolean;
}

@Injectable()
export class DrawingsService {
  constructor(
    @InjectRepository(StandardDrawing)
    private drawingRepository: Repository<StandardDrawing>,
    @InjectRepository(DrawingCategory)
    private categoryRepository: Repository<DrawingCategory>,
    @InjectRepository(DrawingParameter)
    private parameterRepository: Repository<DrawingParameter>,
    private fileStorageService: FileStorageService,
    private cadService: CadService,
    private validationService: ValidationService,
    private imageProcessorService: ImageProcessorService,
  ) {}

  async uploadDrawing(
    file: Express.Multer.File,
    data: CreateDrawingDto,
  ): Promise<StandardDrawing> {
    // Upload file to storage
    const filePath = await this.fileStorageService.uploadFile(file);

    // Detect file type
    const fileExtension = file.originalname.split('.').pop()?.toLowerCase();
    const isImageOrPdf = ['png', 'jpg', 'jpeg', 'pdf'].includes(fileExtension || '');

    // Create drawing entry
    const drawing = this.drawingRepository.create({
      name: data.name,
      description: data.description,
      categoryId: data.categoryId,
      uploaderId: data.uploaderId,
      filePath,
      region: data.region,
      state: data.state,
      status: DrawingStatus.PROCESSING,
      isStandard: data.isStandard || false,
    });

    const savedDrawing = await this.drawingRepository.save(drawing);

    // Process file based on type
    if (isImageOrPdf) {
      // Process image/PDF with AI
      try {
        const processingResult = await this.imageProcessorService.processFile(filePath);

        // Save extracted parameters
        if (processingResult.detectedParameters) {
          const extractedParams = {
            ...processingResult.detectedParameters,
            ai_confidence: processingResult.confidence,
            extracted_text: processingResult.extractedText,
          };
          await this.saveParameters(savedDrawing.id, extractedParams);
        }

        // Update drawing with AI metadata
        savedDrawing.status = DrawingStatus.VALIDATED;
        savedDrawing.validationResults = {
          aiProcessed: true,
          confidence: processingResult.confidence,
          dimensions: processingResult.dimensions,
          extractedText: processingResult.extractedText,
        };
        await this.drawingRepository.save(savedDrawing);
      } catch (error) {
        console.error('Image processing error:', error);
        await this.drawingRepository.update(savedDrawing.id, {
          status: DrawingStatus.REJECTED,
        });
      }
    } else {
      // Process CAD file in background
      await this.cadService.processCADFile(savedDrawing.id, filePath);
    }

    // If manual parameters provided, save them
    if (data.parameters) {
      await this.saveParameters(savedDrawing.id, data.parameters);
    }

    // Trigger validation (async)
    setTimeout(async () => {
      try {
        await this.validationService.validateDrawing(savedDrawing.id);
      } catch (error) {
        console.error('Validation error:', error);
      }
    }, 5000);

    return savedDrawing;
  }

  async findAll(filters?: {
    categoryId?: string;
    status?: DrawingStatus;
    region?: string;
    state?: string;
    search?: string;
  }): Promise<StandardDrawing[]> {
    const query = this.drawingRepository.createQueryBuilder('drawing')
      .leftJoinAndSelect('drawing.category', 'category')
      .leftJoinAndSelect('drawing.uploader', 'uploader')
      .leftJoinAndSelect('drawing.parameters', 'parameters');

    if (filters?.categoryId) {
      query.andWhere('drawing.categoryId = :categoryId', { categoryId: filters.categoryId });
    }

    if (filters?.status) {
      query.andWhere('drawing.status = :status', { status: filters.status });
    }

    if (filters?.region) {
      query.andWhere('drawing.region = :region', { region: filters.region });
    }

    if (filters?.state) {
      query.andWhere('drawing.state = :state', { state: filters.state });
    }

    if (filters?.search) {
      query.andWhere(
        '(drawing.name ILIKE :search OR drawing.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    query.orderBy('drawing.createdAt', 'DESC');

    return query.getMany();
  }

  async findById(id: string): Promise<StandardDrawing> {
    const drawing = await this.drawingRepository.findOne({
      where: { id },
      relations: ['category', 'uploader', 'parameters'],
    });

    if (!drawing) {
      throw new NotFoundException('Drawing not found');
    }

    // Increment view count
    await this.drawingRepository.increment({ id }, 'viewCount', 1);

    return drawing;
  }

  async searchDrawings(criteria: any): Promise<StandardDrawing[]> {
    const query = this.drawingRepository.createQueryBuilder('drawing')
      .leftJoinAndSelect('drawing.category', 'category')
      .leftJoinAndSelect('drawing.parameters', 'parameters')
      .where('drawing.status = :status', { status: DrawingStatus.VALIDATED });

    // Search by parameter ranges
    if (criteria.minPlotArea || criteria.maxPlotArea) {
      query.innerJoin(
        'drawing.parameters',
        'param_plot',
        'param_plot.parameterName = :plotAreaParam',
        { plotAreaParam: 'plot_area' },
      );

      if (criteria.minPlotArea) {
        query.andWhere('CAST(param_plot.parameterValue AS FLOAT) >= :minArea', {
          minArea: criteria.minPlotArea,
        });
      }

      if (criteria.maxPlotArea) {
        query.andWhere('CAST(param_plot.parameterValue AS FLOAT) <= :maxArea', {
          maxArea: criteria.maxPlotArea,
        });
      }
    }

    if (criteria.bedrooms) {
      query.innerJoin(
        'drawing.parameters',
        'param_bed',
        'param_bed.parameterName = :bedroomParam AND param_bed.parameterValue = :bedrooms',
        { bedroomParam: 'num_bedrooms', bedrooms: criteria.bedrooms.toString() },
      );
    }

    return query.getMany();
  }

  async updateDrawing(id: string, data: Partial<StandardDrawing>): Promise<StandardDrawing> {
    await this.drawingRepository.update(id, data);
    return this.findById(id);
  }

  async deleteDrawing(id: string): Promise<void> {
    const drawing = await this.findById(id);

    // Delete file from storage
    await this.fileStorageService.deleteFile(drawing.filePath);

    // Delete drawing
    await this.drawingRepository.delete(id);
  }

  async saveParameters(drawingId: string, parameters: Record<string, any>): Promise<void> {
    const paramEntries = Object.entries(parameters).map(([key, value]) => {
      return this.parameterRepository.create({
        drawingId,
        parameterName: key,
        parameterValue: String(value),
        dataType: typeof value === 'number' ? ParameterDataType.NUMERIC : ParameterDataType.TEXT,
      });
    });

    await this.parameterRepository.save(paramEntries);
  }

  // Category management
  async getCategories(): Promise<DrawingCategory[]> {
    return this.categoryRepository.find({
      relations: ['parent', 'children'],
      order: { order: 'ASC' },
    });
  }

  async createCategory(data: Partial<DrawingCategory>): Promise<DrawingCategory> {
    const category = this.categoryRepository.create(data);
    return this.categoryRepository.save(category);
  }
}
