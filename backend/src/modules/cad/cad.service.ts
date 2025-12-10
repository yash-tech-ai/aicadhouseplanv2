import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { CadMetadata, CadMetadataDocument } from '@/database/schemas/cad-metadata.schema';
import { CadProcessorService } from './services/cad-processor.service';

@Injectable()
export class CadService {
  constructor(
    @InjectModel(CadMetadata.name)
    private cadMetadataModel: Model<CadMetadataDocument>,
    @InjectQueue('cad-processing')
    private cadProcessingQueue: Queue,
    private cadProcessorService: CadProcessorService,
  ) {}

  async processCADFile(drawingId: string, filePath: string): Promise<CadMetadataDocument> {
    // Queue the processing job
    await this.cadProcessingQueue.add('process-cad', {
      drawingId,
      filePath,
    });

    // Create initial metadata entry
    const metadata = new this.cadMetadataModel({
      drawingId,
      processingStatus: 'queued',
      extractedData: {},
      parameters: {},
      computedFeatures: {},
    });

    return metadata.save();
  }

  async getMetadata(drawingId: string): Promise<CadMetadataDocument> {
    return this.cadMetadataModel.findOne({ drawingId }).exec();
  }

  async updateMetadata(
    drawingId: string,
    data: Partial<CadMetadata>,
  ): Promise<CadMetadataDocument> {
    return this.cadMetadataModel
      .findOneAndUpdate({ drawingId }, data, { new: true })
      .exec();
  }

  async extractParameters(drawingId: string): Promise<any> {
    const metadata = await this.getMetadata(drawingId);
    return metadata?.parameters || {};
  }
}
