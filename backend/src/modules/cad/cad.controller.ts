import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { CadService } from './cad.service';

@ApiTags('cad')
@Controller('cad')
export class CadController {
  constructor(private readonly cadService: CadService) {}

  @Get('metadata/:drawingId')
  @ApiOperation({ summary: 'Get CAD metadata for a drawing' })
  async getMetadata(@Param('drawingId') drawingId: string) {
    return this.cadService.getMetadata(drawingId);
  }

  @Get('parameters/:drawingId')
  @ApiOperation({ summary: 'Get extracted parameters from a drawing' })
  async getParameters(@Param('drawingId') drawingId: string) {
    return this.cadService.extractParameters(drawingId);
  }
}
