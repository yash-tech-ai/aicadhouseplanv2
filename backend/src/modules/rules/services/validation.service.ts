import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { InjectRepository } from '@nestjs/typeorm';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import { RulesService } from '../rules.service';
import { RuleEngineService, RuleEvaluationResult } from './rule-engine.service';
import { CadMetadata, CadMetadataDocument } from '@/database/schemas/cad-metadata.schema';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';

export interface ValidationReport {
  drawingId: string;
  overallScore: number;
  passed: boolean;
  totalRules: number;
  passedRules: number;
  failedRules: number;
  ruleResults: RuleEvaluationResult[];
  summary: {
    violations: string[];
    suggestions: string[];
    criticalIssues: string[];
  };
}

@Injectable()
export class ValidationService {
  constructor(
    private rulesService: RulesService,
    private ruleEngineService: RuleEngineService,
    @InjectModel(CadMetadata.name)
    private cadMetadataModel: Model<CadMetadataDocument>,
    @InjectRepository(StandardDrawing)
    private drawingRepository: Repository<StandardDrawing>,
  ) {}

  async validateDrawing(drawingId: string): Promise<ValidationReport> {
    // Get drawing details
    const drawing = await this.drawingRepository.findOne({
      where: { id: drawingId },
      relations: ['category'],
    });

    if (!drawing) {
      throw new Error('Drawing not found');
    }

    // Get CAD metadata
    const metadata = await this.cadMetadataModel.findOne({ drawingId }).exec();

    if (!metadata) {
      throw new Error('CAD metadata not found');
    }

    const parameters = metadata.parameters;

    // Get applicable rules
    const rules = await this.rulesService.findApplicableRules(
      drawing.region || 'India',
      drawing.state || 'Maharashtra',
      drawing.category?.name,
    );

    // Evaluate each rule
    const ruleResults: RuleEvaluationResult[] = rules.map(rule =>
      this.ruleEngineService.evaluateRule(rule, parameters),
    );

    // Calculate overall score
    const totalRules = ruleResults.length;
    const passedRules = ruleResults.filter(r => r.passed).length;
    const failedRules = totalRules - passedRules;

    const overallScore = totalRules > 0
      ? ruleResults.reduce((sum, r) => sum + r.score, 0) / totalRules
      : 0;

    // Collect violations and suggestions
    const violations: string[] = [];
    const suggestions: string[] = [];
    const criticalIssues: string[] = [];

    ruleResults.forEach(result => {
      if (!result.passed) {
        violations.push(...result.violations);
        suggestions.push(...result.suggestions);

        if (result.score < 50) {
          criticalIssues.push(
            `Critical: ${result.ruleName} - Score: ${result.score.toFixed(2)}%`,
          );
        }
      }
    });

    const report: ValidationReport = {
      drawingId,
      overallScore: Math.round(overallScore * 100) / 100,
      passed: overallScore >= 70, // 70% threshold for passing
      totalRules,
      passedRules,
      failedRules,
      ruleResults,
      summary: {
        violations,
        suggestions,
        criticalIssues,
      },
    };

    // Update drawing with validation results
    await this.drawingRepository.update(drawingId, {
      validationScore: report.overallScore,
      validationResults: report,
      status: report.passed ? 'validated' : 'rejected',
    });

    return report;
  }
}
