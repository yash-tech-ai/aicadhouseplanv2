import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SimilarityCalculatorService } from './similarity-calculator.service';

export interface MatchCalculationResult {
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
export class MatchingAlgorithmService {
  private weights = {
    geometric: 0.30,
    parameter: 0.40,
    layout: 0.20,
    compliance: 0.10,
  };

  constructor(
    private configService: ConfigService,
    private similarityCalculator: SimilarityCalculatorService,
  ) {
    // Load weights from config if available
    this.weights.geometric = parseFloat(
      this.configService.get('WEIGHT_GEOMETRIC', '0.30'),
    );
    this.weights.parameter = parseFloat(
      this.configService.get('WEIGHT_PARAMETER', '0.40'),
    );
    this.weights.layout = parseFloat(
      this.configService.get('WEIGHT_LAYOUT', '0.20'),
    );
    this.weights.compliance = parseFloat(
      this.configService.get('WEIGHT_COMPLIANCE', '0.10'),
    );
  }

  calculateMatch(
    sourceMetadata: any,
    candidateMetadata: any,
  ): MatchCalculationResult {
    // 1. Geometric Similarity (30%)
    const geometricScore = this.calculateGeometricSimilarity(
      sourceMetadata.geometricData,
      candidateMetadata.geometricData,
    );

    // 2. Parameter Similarity (40%)
    const parameterScore = this.calculateParameterSimilarity(
      sourceMetadata.parameters,
      candidateMetadata.parameters,
    );

    // 3. Layout Similarity (20%)
    const layoutScore = this.calculateLayoutSimilarity(
      sourceMetadata.computedFeatures,
      candidateMetadata.computedFeatures,
    );

    // 4. Compliance Similarity (10%)
    const complianceScore = this.calculateComplianceSimilarity(
      sourceMetadata,
      candidateMetadata,
    );

    // Calculate weighted average
    const matchScore =
      geometricScore * this.weights.geometric +
      parameterScore * this.weights.parameter +
      layoutScore * this.weights.layout +
      complianceScore * this.weights.compliance;

    // Identify similarities and differences
    const { similarities, differences } = this.identifyKeyDifferences(
      sourceMetadata.parameters,
      candidateMetadata.parameters,
    );

    return {
      matchScore: Math.round(matchScore * 100) / 100,
      matchDetails: {
        geometricScore: Math.round(geometricScore * 100) / 100,
        parameterScore: Math.round(parameterScore * 100) / 100,
        layoutScore: Math.round(layoutScore * 100) / 100,
        complianceScore: Math.round(complianceScore * 100) / 100,
      },
      similarities,
      differences,
    };
  }

  private calculateGeometricSimilarity(source: any, candidate: any): number {
    if (!source || !candidate) return 0;

    const scores: number[] = [];

    // Compare plot dimensions
    if (source.bounds && candidate.bounds) {
      const sourceArea =
        (source.bounds.maxX - source.bounds.minX) *
        (source.bounds.maxY - source.bounds.minY);
      const candidateArea =
        (candidate.bounds.maxX - candidate.bounds.minX) *
        (candidate.bounds.maxY - candidate.bounds.minY);

      scores.push(this.similarityCalculator.numericSimilarity(sourceArea, candidateArea, 0.3));
    }

    // Compare aspect ratios
    if (source.bounds && candidate.bounds) {
      const sourceRatio =
        (source.bounds.maxX - source.bounds.minX) /
        (source.bounds.maxY - source.bounds.minY);
      const candidateRatio =
        (candidate.bounds.maxX - candidate.bounds.minX) /
        (candidate.bounds.maxY - candidate.bounds.minY);

      scores.push(this.similarityCalculator.numericSimilarity(sourceRatio, candidateRatio, 0.2));
    }

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private calculateParameterSimilarity(source: any, candidate: any): number {
    if (!source || !candidate) return 0;

    const importantParams = [
      'plot_area',
      'built_up_area',
      'num_bedrooms',
      'num_bathrooms',
      'num_floors',
      'open_space_percentage',
      'setback_front',
      'setback_rear',
    ];

    const scores: number[] = [];

    importantParams.forEach(param => {
      if (source[param] !== undefined && candidate[param] !== undefined) {
        const tolerance = this.getToleranceForParam(param);
        scores.push(
          this.similarityCalculator.numericSimilarity(
            source[param],
            candidate[param],
            tolerance,
          ),
        );
      }
    });

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private calculateLayoutSimilarity(source: any, candidate: any): number {
    if (!source || !candidate) return 0;

    const scores: number[] = [];

    // Room count similarity
    if (source.room_count && candidate.room_count) {
      scores.push(
        this.similarityCalculator.numericSimilarity(
          source.room_count,
          candidate.room_count,
          0.3,
        ),
      );
    }

    // Door count similarity
    if (source.door_count && candidate.door_count) {
      scores.push(
        this.similarityCalculator.numericSimilarity(
          source.door_count,
          candidate.door_count,
          0.4,
        ),
      );
    }

    // Window count similarity
    if (source.window_count && candidate.window_count) {
      scores.push(
        this.similarityCalculator.numericSimilarity(
          source.window_count,
          candidate.window_count,
          0.4,
        ),
      );
    }

    // Compactness ratio
    if (source.compactness_ratio && candidate.compactness_ratio) {
      scores.push(
        this.similarityCalculator.numericSimilarity(
          source.compactness_ratio,
          candidate.compactness_ratio,
          0.2,
        ),
      );
    }

    return scores.length > 0
      ? scores.reduce((a, b) => a + b, 0) / scores.length
      : 0;
  }

  private calculateComplianceSimilarity(source: any, candidate: any): number {
    // If both have similar validation scores, they're compliant in similar ways
    const sourceScore = source.validationScore || 0;
    const candidateScore = candidate.validationScore || 0;

    return this.similarityCalculator.numericSimilarity(sourceScore, candidateScore, 0.2);
  }

  private getToleranceForParam(param: string): number {
    const tolerances: Record<string, number> = {
      plot_area: 0.25,
      built_up_area: 0.25,
      num_bedrooms: 0.5,
      num_bathrooms: 0.5,
      num_floors: 0.5,
      open_space_percentage: 0.15,
      setback_front: 0.3,
      setback_rear: 0.3,
    };

    return tolerances[param] || 0.2;
  }

  private identifyKeyDifferences(
    source: any,
    candidate: any,
  ): { similarities: string[]; differences: string[] } {
    const similarities: string[] = [];
    const differences: string[] = [];

    const checkParam = (
      param: string,
      label: string,
      tolerance: number = 0.2,
    ) => {
      if (source[param] !== undefined && candidate[param] !== undefined) {
        const score = this.similarityCalculator.numericSimilarity(
          source[param],
          candidate[param],
          tolerance,
        );

        if (score >= 80) {
          similarities.push(`Similar ${label}: ${source[param]} vs ${candidate[param]}`);
        } else if (score < 50) {
          differences.push(`Different ${label}: ${source[param]} vs ${candidate[param]}`);
        }
      }
    };

    checkParam('plot_area', 'plot area', 0.25);
    checkParam('num_bedrooms', 'bedroom count', 0.5);
    checkParam('num_bathrooms', 'bathroom count', 0.5);
    checkParam('built_up_area', 'built-up area', 0.25);
    checkParam('open_space_percentage', 'open space %', 0.15);

    return { similarities, differences };
  }
}
