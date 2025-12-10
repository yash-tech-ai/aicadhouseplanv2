import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CadMetadataDocument = CadMetadata & Document;

@Schema({ collection: 'cad_metadata', timestamps: true })
export class CadMetadata {
  @Prop({ required: true, unique: true })
  drawingId: string;

  @Prop({ type: Object })
  extractedData: {
    entities?: any[];
    layers?: any[];
    blocks?: any[];
    header?: any;
  };

  @Prop({ type: Object })
  parameters: {
    // Plot dimensions
    plot_length?: number;
    plot_width?: number;
    plot_area?: number;

    // Setbacks
    setback_front?: number;
    setback_rear?: number;
    setback_left?: number;
    setback_right?: number;

    // Building details
    num_floors?: number;
    num_bedrooms?: number;
    num_bathrooms?: number;
    num_kitchens?: number;
    num_living_rooms?: number;

    // Areas
    built_up_area?: number;
    carpet_area?: number;
    open_space_area?: number;
    open_space_percentage?: number;

    // Height and FAR
    building_height?: number;
    far_consumed?: number;

    // Road and infrastructure
    approaching_road_width?: number;
    approaching_road_direction?: string;
    overhead_wire_distance?: number;

    // Parking
    parking_spaces?: number;

    // Staircase
    staircase_type?: string;
    staircase_width?: number;

    // Additional
    balcony_count?: number;
    terrace_area?: number;

    // Custom parameters
    [key: string]: any;
  };

  @Prop({ type: Object })
  computedFeatures: {
    room_count?: number;
    total_rooms?: number;
    wall_total_length?: number;
    door_count?: number;
    window_count?: number;
    perimeter?: number;
    compactness_ratio?: number;
  };

  @Prop({ type: Object })
  geometricData: {
    bounds?: {
      minX: number;
      minY: number;
      maxX: number;
      maxY: number;
    };
    centroid?: {
      x: number;
      y: number;
    };
    walls?: any[];
    doors?: any[];
    windows?: any[];
    rooms?: any[];
  };

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  processingStatus: string;

  @Prop({ type: Object })
  processingErrors: any;
}

export const CadMetadataSchema = SchemaFactory.createForClass(CadMetadata);

// Indexes for faster queries
CadMetadataSchema.index({ drawingId: 1 });
CadMetadataSchema.index({ 'parameters.plot_area': 1 });
CadMetadataSchema.index({ 'parameters.num_bedrooms': 1 });
CadMetadataSchema.index({ 'parameters.built_up_area': 1 });
CadMetadataSchema.index({ tags: 1 });
