import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { DrawingsService, CreateDrawingDto } from './drawings.service';
import { DrawingStatus } from '@/database/entities/standard-drawing.entity';

@ApiTags('drawings')
@Controller('drawings')
export class DrawingsController {
  constructor(private readonly drawingsService: DrawingsService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a new CAD drawing' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDrawing(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 52428800 }), // 50MB
          new FileTypeValidator({ fileType: /(dxf|dwg)$/ }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Body() data: CreateDrawingDto,
  ) {
    return this.drawingsService.uploadDrawing(file, data);
  }

  @Get()
  @ApiOperation({ summary: 'Get all drawings with optional filters' })
  async findAll(
    @Query('categoryId') categoryId?: string,
    @Query('status') status?: DrawingStatus,
    @Query('region') region?: string,
    @Query('state') state?: string,
    @Query('search') search?: string,
  ) {
    return this.drawingsService.findAll({
      categoryId,
      status,
      region,
      state,
      search,
    });
  }

  @Get('search')
  @ApiOperation({ summary: 'Search drawings by parameters' })
  async search(
    @Query('minPlotArea') minPlotArea?: number,
    @Query('maxPlotArea') maxPlotArea?: number,
    @Query('bedrooms') bedrooms?: number,
    @Query('bathrooms') bathrooms?: number,
  ) {
    return this.drawingsService.searchDrawings({
      minPlotArea,
      maxPlotArea,
      bedrooms,
      bathrooms,
    });
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all drawing categories' })
  async getCategories() {
    return this.drawingsService.getCategories();
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  async createCategory(@Body() data: any) {
    return this.drawingsService.createCategory(data);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get drawing by ID' })
  async findOne(@Param('id') id: string) {
    return this.drawingsService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update drawing details' })
  async update(@Param('id') id: string, @Body() data: any) {
    return this.drawingsService.updateDrawing(id, data);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a drawing (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.drawingsService.deleteDrawing(id);
    return { message: 'Drawing deleted successfully' };
  }
}
