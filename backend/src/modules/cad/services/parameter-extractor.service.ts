import { Injectable } from '@nestjs/common';
import { CadParserService } from './cad-parser.service';

@Injectable()
export class ParameterExtractorService {
  constructor(private cadParserService: CadParserService) {}

  async extractParameters(parsedData: any): Promise<any> {
    const entities = parsedData.entities || [];
    const bounds = this.cadParserService.getBounds(entities);

    // Extract basic geometric parameters
    const parameters: any = {
      // Plot dimensions (from bounds)
      plot_length: this.roundTo2Decimals(bounds.maxX - bounds.minX),
      plot_width: this.roundTo2Decimals(bounds.maxY - bounds.minY),
    };

    // Calculate plot area
    parameters.plot_area = this.roundTo2Decimals(
      parameters.plot_length * parameters.plot_width,
    );

    // Extract room counts and types
    const roomData = this.extractRoomInformation(entities);
    Object.assign(parameters, roomData);

    // Extract wall information
    const wallData = this.extractWallInformation(entities);
    Object.assign(parameters, wallData);

    // Extract door and window counts
    parameters.door_count = this.countEntitiesByLayer(entities, ['DOOR', 'DOORS']);
    parameters.window_count = this.countEntitiesByLayer(entities, ['WINDOW', 'WINDOWS']);

    // Extract text annotations for additional parameters
    const textParams = this.extractParametersFromText(entities);
    Object.assign(parameters, textParams);

    return parameters;
  }

  private extractRoomInformation(entities: any[]): any {
    // Look for closed polylines or rectangles that might represent rooms
    const possibleRooms = entities.filter(
      e => (e.type === 'LWPOLYLINE' || e.type === 'POLYLINE') && e.vertices && e.vertices.length >= 4,
    );

    // Count text entities that might indicate room names
    const textEntities = entities.filter(e => e.type === 'TEXT' || e.type === 'MTEXT');

    const roomTypes = {
      bedroom: 0,
      bathroom: 0,
      kitchen: 0,
      living: 0,
      dining: 0,
      balcony: 0,
    };

    textEntities.forEach((text: any) => {
      const content = (text.text || '').toLowerCase();
      if (content.includes('bed') || content.includes('br')) roomTypes.bedroom++;
      if (content.includes('bath') || content.includes('wc') || content.includes('toilet')) roomTypes.bathroom++;
      if (content.includes('kitchen')) roomTypes.kitchen++;
      if (content.includes('living') || content.includes('hall')) roomTypes.living++;
      if (content.includes('dining')) roomTypes.dining++;
      if (content.includes('balcony')) roomTypes.balcony++;
    });

    return {
      num_bedrooms: roomTypes.bedroom,
      num_bathrooms: roomTypes.bathroom,
      num_kitchens: roomTypes.kitchen,
      num_living_rooms: roomTypes.living,
      total_rooms: possibleRooms.length,
      balcony_count: roomTypes.balcony,
    };
  }

  private extractWallInformation(entities: any[]): any {
    // Walls are typically lines on specific layers
    const walls = entities.filter(
      e => e.type === 'LINE' &&
           e.layer &&
           (e.layer.toUpperCase().includes('WALL') || e.layer.toUpperCase().includes('0')),
    );

    let totalWallLength = 0;
    walls.forEach((wall: any) => {
      if (wall.startPoint && wall.endPoint) {
        const dx = wall.endPoint.x - wall.startPoint.x;
        const dy = wall.endPoint.y - wall.startPoint.y;
        totalWallLength += Math.sqrt(dx * dx + dy * dy);
      }
    });

    return {
      wall_total_length: this.roundTo2Decimals(totalWallLength),
      wall_count: walls.length,
    };
  }

  private extractParametersFromText(entities: any[]): any {
    const textEntities = entities.filter(e => e.type === 'TEXT' || e.type === 'MTEXT');
    const parameters: any = {};

    textEntities.forEach((text: any) => {
      const content = (text.text || '').toLowerCase();

      // Look for common parameter patterns
      if (content.includes('plot') && content.includes('area')) {
        const match = content.match(/(\d+\.?\d*)/);
        if (match) parameters.plot_area_annotated = parseFloat(match[1]);
      }

      if (content.includes('built') && content.includes('up')) {
        const match = content.match(/(\d+\.?\d*)/);
        if (match) parameters.built_up_area = parseFloat(match[1]);
      }

      if (content.includes('setback') || content.includes('set back')) {
        const match = content.match(/(\d+\.?\d*)/);
        if (match) {
          if (content.includes('front')) parameters.setback_front = parseFloat(match[1]);
          if (content.includes('rear') || content.includes('back')) parameters.setback_rear = parseFloat(match[1]);
          if (content.includes('side') || content.includes('left')) parameters.setback_left = parseFloat(match[1]);
          if (content.includes('right')) parameters.setback_right = parseFloat(match[1]);
        }
      }
    });

    return parameters;
  }

  private countEntitiesByLayer(entities: any[], layerNames: string[]): number {
    return entities.filter(e =>
      e.layer && layerNames.some(name => e.layer.toUpperCase().includes(name)),
    ).length;
  }

  private roundTo2Decimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  computeFeatures(parsedData: any, parameters: any): any {
    const entities = parsedData.entities || [];

    return {
      room_count: parameters.total_rooms || 0,
      door_count: parameters.door_count || 0,
      window_count: parameters.window_count || 0,
      wall_total_length: parameters.wall_total_length || 0,
      perimeter: this.calculatePerimeter(parameters),
      compactness_ratio: this.calculateCompactness(parameters),
    };
  }

  private calculatePerimeter(parameters: any): number {
    if (parameters.plot_length && parameters.plot_width) {
      return 2 * (parameters.plot_length + parameters.plot_width);
    }
    return 0;
  }

  private calculateCompactness(parameters: any): number {
    // Compactness = 4π * Area / Perimeter²
    const area = parameters.plot_area || 0;
    const perimeter = this.calculatePerimeter(parameters);

    if (perimeter === 0) return 0;

    return this.roundTo2Decimals((4 * Math.PI * area) / (perimeter * perimeter));
  }
}
