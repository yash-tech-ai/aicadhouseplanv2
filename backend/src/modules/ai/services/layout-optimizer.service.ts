import { Injectable } from '@nestjs/common';
import { OptimizationSuggestion } from '../ai.service';

@Injectable()
export class LayoutOptimizerService {
  async analyzeAndOptimize(drawingId: string, parameters: any): Promise<OptimizationSuggestion[]> {
    const suggestions: OptimizationSuggestion[] = [];

    // Check open space compliance
    if (parameters.open_space_percentage && parameters.open_space_percentage < 25) {
      suggestions.push({
        type: 'compliance',
        priority: 'high',
        title: 'Insufficient Open Space',
        description: `Current open space is ${parameters.open_space_percentage}%. Minimum 25% required.`,
        impact: 'Non-compliance with building regulations',
        implementationNotes: 'Reduce built-up area or increase plot size',
      });
    }

    // Check setback compliance
    if (parameters.setback_front && parameters.setback_front < 3) {
      suggestions.push({
        type: 'compliance',
        priority: 'high',
        title: 'Front Setback Violation',
        description: `Front setback is ${parameters.setback_front}m. Minimum 3m required.`,
        impact: 'Building approval will be rejected',
        implementationNotes: 'Adjust building placement to maintain 3m front setback',
      });
    }

    // Room efficiency suggestions
    if (parameters.num_bedrooms && parameters.built_up_area) {
      const areaPerRoom = parameters.built_up_area / (parameters.num_bedrooms || 1);
      if (areaPerRoom > 60) {
        suggestions.push({
          type: 'efficiency',
          priority: 'medium',
          title: 'Room Size Optimization',
          description: `Average room size is ${areaPerRoom.toFixed(1)} sq.m, which is larger than typical.`,
          impact: 'Potential for adding another room or reducing costs',
          implementationNotes: 'Consider optimizing room dimensions',
        });
      }
    }

    // Ventilation check
    if (parameters.window_count && parameters.total_rooms) {
      const windowsPerRoom = parameters.window_count / parameters.total_rooms;
      if (windowsPerRoom < 1.5) {
        suggestions.push({
          type: 'room_layout',
          priority: 'medium',
          title: 'Improve Natural Ventilation',
          description: 'Add more windows for better cross-ventilation',
          impact: 'Improved air quality and reduced energy costs',
          implementationNotes: 'Aim for at least 2 windows per habitable room',
        });
      }
    }

    return suggestions;
  }

  async suggestRoomConfiguration(parameters: any): Promise<any> {
    const config: any = {
      bedrooms: [],
      bathrooms: [],
      commonAreas: [],
      circulation: null,
    };

    const numBedrooms = parameters.num_bedrooms || 3;
    const numBathrooms = parameters.num_bathrooms || 2;
    const plotArea = parameters.plot_area || 1500;

    // Suggest bedroom sizes
    for (let i = 0; i < numBedrooms; i++) {
      const isMaster = i === 0;
      config.bedrooms.push({
        name: isMaster ? 'Master Bedroom' : `Bedroom ${i + 1}`,
        suggestedArea: isMaster ? 180 : 120, // sq.ft
        features: isMaster ? ['Attached bathroom', 'Wardrobe'] : ['Wardrobe'],
        placement: isMaster ? 'Corner with maximum privacy' : 'Along side walls',
      });
    }

    // Suggest bathroom configuration
    for (let i = 0; i < numBathrooms; i++) {
      config.bathrooms.push({
        name: i === 0 ? 'Master Bathroom' : `Common Bathroom ${i}`,
        suggestedArea: 40,
        placement: i === 0 ? 'Attached to master bedroom' : 'Accessible from common area',
      });
    }

    // Suggest common areas
    config.commonAreas = [
      {
        name: 'Living Room',
        suggestedArea: 200,
        placement: 'Front, near main entrance',
      },
      {
        name: 'Kitchen',
        suggestedArea: 100,
        placement: 'Rear or side, near service entrance',
      },
      {
        name: 'Dining Area',
        suggestedArea: 100,
        placement: 'Adjacent to living room and kitchen',
      },
    ];

    // Circulation suggestion
    config.circulation = {
      corridorWidth: 4, // feet
      note: 'Keep corridors minimum 3.5-4 feet wide for comfortable movement',
    };

    return config;
  }
}
