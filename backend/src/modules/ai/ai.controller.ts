import { Controller, Post, Get, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AiService } from './ai.service';

@ApiTags('ai')
@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('suggest-layouts')
  @ApiOperation({ summary: 'Get AI-powered layout suggestions based on parameters' })
  async suggestLayouts(@Body() parameters: any) {
    return this.aiService.suggestLayouts(parameters);
  }

  @Post('optimize/:drawingId')
  @ApiOperation({ summary: 'Get optimization suggestions for a drawing' })
  async optimizeLayout(
    @Param('drawingId') drawingId: string,
    @Body() parameters: any,
  ) {
    return this.aiService.optimizeLayout(drawingId, parameters);
  }

  @Post('suggest-room-placement')
  @ApiOperation({ summary: 'Get AI suggestions for room placement' })
  async suggestRoomPlacement(@Body() parameters: any) {
    return this.aiService.suggestRoomPlacement(parameters);
  }
}
