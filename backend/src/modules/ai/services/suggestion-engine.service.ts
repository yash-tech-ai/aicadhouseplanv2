import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { CadMetadata, CadMetadataDocument } from '@/database/schemas/cad-metadata.schema';
import { LayoutSuggestion } from '../ai.service';

@Injectable()
export class SuggestionEngineService {
  constructor(
    @InjectRepository(StandardDrawing)
    private drawingRepository: Repository<StandardDrawing>,
    @InjectModel(CadMetadata.name)
    private cadMetadataModel: Model<CadMetadataDocument>,
  ) {}

  async generateSuggestions(parameters: any): Promise<LayoutSuggestion[]> {
    const suggestions: LayoutSuggestion[] = [];

    // Find drawings with similar parameters
    const similarDrawings = await this.findSimilarDrawings(parameters);

    // Sort by popularity (match count and view count)
    similarDrawings.sort((a, b) => {
      const scoreA = (a.drawing.matchCount || 0) * 2 + (a.drawing.viewCount || 0);
      const scoreB = (b.drawing.matchCount || 0) * 2 + (b.drawing.viewCount || 0);
      return scoreB - scoreA;
    });

    // Take top 3 most popular
    for (const item of similarDrawings.slice(0, 3)) {
      const reasons = this.generateReasons(parameters, item.metadata.parameters);

      suggestions.push({
        drawingId: item.drawing.id,
        name: item.drawing.name,
        description: item.drawing.description || 'Popular layout for your requirements',
        matchScore: item.matchScore,
        popularity: (item.drawing.matchCount || 0) * 2 + (item.drawing.viewCount || 0),
        thumbnail: item.drawing.thumbnailPath,
        reasons,
      });
    }

    return suggestions;
  }

  private async findSimilarDrawings(parameters: any): Promise<any[]> {
    // Build MongoDB aggregation pipeline to find similar drawings
    const pipeline: any[] = [];

    // Match by key parameters with tolerance
    const matchConditions: any = {};

    if (parameters.plot_area) {
      const tolerance = parameters.plot_area * 0.25;
      matchConditions['parameters.plot_area'] = {
        $gte: parameters.plot_area - tolerance,
        $lte: parameters.plot_area + tolerance,
      };
    }

    if (parameters.num_bedrooms) {
      matchConditions['parameters.num_bedrooms'] = {
        $gte: Math.max(1, parameters.num_bedrooms - 1),
        $lte: parameters.num_bedrooms + 1,
      };
    }

    if (parameters.num_floors) {
      matchConditions['parameters.num_floors'] = parameters.num_floors;
    }

    if (Object.keys(matchConditions).length > 0) {
      pipeline.push({ $match: matchConditions });
    }

    pipeline.push({ $limit: 20 });

    const metadataResults = await this.cadMetadataModel.aggregate(pipeline).exec();

    // Get corresponding drawings
    const results: any[] = [];

    for (const metadata of metadataResults) {
      const drawing = await this.drawingRepository.findOne({
        where: { id: metadata.drawingId },
        relations: ['category'],
      });

      if (drawing && drawing.status === 'validated') {
        // Calculate simple match score
        const matchScore = this.calculateQuickMatchScore(parameters, metadata.parameters);

        results.push({
          drawing,
          metadata,
          matchScore,
        });
      }
    }

    return results;
  }

  private calculateQuickMatchScore(source: any, candidate: any): number {
    let score = 100;

    // Plot area difference
    if (source.plot_area && candidate.plot_area) {
      const diff = Math.abs(source.plot_area - candidate.plot_area) / source.plot_area;
      score -= diff * 30;
    }

    // Bedroom difference
    if (source.num_bedrooms && candidate.num_bedrooms) {
      const diff = Math.abs(source.num_bedrooms - candidate.num_bedrooms);
      score -= diff * 10;
    }

    // Bathroom difference
    if (source.num_bathrooms && candidate.num_bathrooms) {
      const diff = Math.abs(source.num_bathrooms - candidate.num_bathrooms);
      score -= diff * 5;
    }

    return Math.max(0, Math.min(100, score));
  }

  private generateReasons(source: any, candidate: any): string[] {
    const reasons: string[] = [];

    if (source.num_bedrooms && candidate.num_bedrooms) {
      if (source.num_bedrooms === candidate.num_bedrooms) {
        reasons.push(`Exact match: ${candidate.num_bedrooms} bedrooms`);
      }
    }

    if (source.plot_area && candidate.plot_area) {
      const diff = Math.abs(source.plot_area - candidate.plot_area) / source.plot_area;
      if (diff < 0.15) {
        reasons.push(`Similar plot size: ${candidate.plot_area} sq.m`);
      }
    }

    if (candidate.open_space_percentage && candidate.open_space_percentage >= 30) {
      reasons.push('Excellent open space percentage');
    }

    return reasons.length > 0 ? reasons : ['Matches your basic requirements'];
  }
}
