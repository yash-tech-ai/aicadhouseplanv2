import { Injectable } from '@nestjs/common';
import { SuggestionEngineService } from './services/suggestion-engine.service';
import { LayoutOptimizerService } from './services/layout-optimizer.service';

export interface LayoutSuggestion {
  drawingId: string;
  name: string;
  description: string;
  matchScore: number;
  popularity: number;
  thumbnail?: string;
  reasons: string[];
}

export interface OptimizationSuggestion {
  type: 'wall_placement' | 'room_layout' | 'compliance' | 'efficiency';
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  impact: string;
  implementationNotes?: string;
}

@Injectable()
export class AiService {
  constructor(
    private suggestionEngine: SuggestionEngineService,
    private layoutOptimizer: LayoutOptimizerService,
  ) {}

  async suggestLayouts(parameters: any): Promise<LayoutSuggestion[]> {
    return this.suggestionEngine.generateSuggestions(parameters);
  }

  async optimizeLayout(drawingId: string, parameters: any): Promise<OptimizationSuggestion[]> {
    return this.layoutOptimizer.analyzeAndOptimize(drawingId, parameters);
  }

  async suggestRoomPlacement(parameters: any): Promise<any> {
    return this.layoutOptimizer.suggestRoomConfiguration(parameters);
  }
}
