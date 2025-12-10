import { Controller, Get, Post, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { MatchingService } from './matching.service';

@ApiTags('matching')
@Controller('matching')
export class MatchingController {
  constructor(private readonly matchingService: MatchingService) {}

  @Get('find/:drawingId')
  @ApiOperation({ summary: 'Find matching drawings' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'minScore', required: false, type: Number })
  @ApiQuery({ name: 'category', required: false, type: String })
  async findMatches(
    @Param('drawingId') drawingId: string,
    @Query('limit') limit?: number,
    @Query('minScore') minScore?: number,
    @Query('category') category?: string,
  ) {
    return this.matchingService.findMatches(drawingId, {
      limit,
      minScore,
      category,
    });
  }
}
