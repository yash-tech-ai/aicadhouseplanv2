import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { CadMetadata, CadMetadataDocument } from '@/database/schemas/cad-metadata.schema';
import { MatchingAlgorithmService } from './services/matching-algorithm.service';

export interface MatchResult {
  drawing: StandardDrawing;
  metadata: any;
  matchScore: number;
  matchDetails: {
    geometricScore: number;
    parameterScore: number;
    layoutScore: number;
    complianceScore: number;
  };
  similarities: string[];
  differences: string[];
}

@Injectable()
export class MatchingService {
  constructor(
    @InjectRepository(StandardDrawing)
    private drawingRepository: Repository<StandardDrawing>,
    @InjectModel(CadMetadata.name)
    private cadMetadataModel: Model<CadMetadataDocument>,
    private matchingAlgorithmService: MatchingAlgorithmService,
  ) {}

  async findMatches(
    drawingId: string,
    options?: {
      limit?: number;
      minScore?: number;
      category?: string;
    },
  ): Promise<MatchResult[]> {
    const limit = options?.limit || 10;
    const minScore = options?.minScore || 50;

    // Get the source drawing metadata
    const sourceMetadata = await this.cadMetadataModel.findOne({ drawingId }).exec();

    if (!sourceMetadata) {
      throw new Error('Drawing metadata not found');
    }

    // Get all standard drawings to compare
    const query = this.drawingRepository.createQueryBuilder('drawing')
      .where('drawing.id != :drawingId', { drawingId })
      .andWhere('drawing.status = :status', { status: 'validated' })
      .leftJoinAndSelect('drawing.category', 'category');

    if (options?.category) {
      query.andWhere('category.name = :category', { category: options.category });
    }

    const candidates = await query.getMany();

    // Calculate match scores for each candidate
    const matches: MatchResult[] = [];

    for (const candidate of candidates) {
      const candidateMetadata = await this.cadMetadataModel
        .findOne({ drawingId: candidate.id })
        .exec();

      if (!candidateMetadata) continue;

      const matchResult = this.matchingAlgorithmService.calculateMatch(
        sourceMetadata,
        candidateMetadata,
      );

      if (matchResult.matchScore >= minScore) {
        matches.push({
          drawing: candidate,
          metadata: candidateMetadata,
          ...matchResult,
        });
      }
    }

    // Sort by match score (highest first) and limit results
    matches.sort((a, b) => b.matchScore - a.matchScore);

    return matches.slice(0, limit);
  }

  async incrementMatchCount(drawingId: string): Promise<void> {
    await this.drawingRepository.increment({ id: drawingId }, 'matchCount', 1);
  }
}
