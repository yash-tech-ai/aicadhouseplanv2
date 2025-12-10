import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as DxfParser from 'dxf-parser';

@Injectable()
export class CadParserService {
  private parser: any;

  constructor() {
    this.parser = new DxfParser();
  }

  async parseDXF(filePath: string): Promise<any> {
    try {
      const fileContent = fs.readFileSync(filePath, 'utf-8');
      const dxf = this.parser.parseSync(fileContent);

      if (!dxf) {
        throw new Error('Failed to parse DXF file');
      }

      return {
        header: dxf.header,
        tables: dxf.tables,
        blocks: dxf.blocks,
        entities: dxf.entities,
      };
    } catch (error) {
      throw new Error(`DXF parsing error: ${error.message}`);
    }
  }

  extractLayers(parsedData: any): any[] {
    if (!parsedData.tables?.layer?.layers) {
      return [];
    }

    return Object.values(parsedData.tables.layer.layers).map((layer: any) => ({
      name: layer.name,
      color: layer.color,
      frozen: layer.frozen,
      visible: layer.visible,
    }));
  }

  extractEntities(parsedData: any, entityType?: string): any[] {
    if (!parsedData.entities) {
      return [];
    }

    const entities = parsedData.entities;

    if (entityType) {
      return entities.filter((e: any) => e.type === entityType);
    }

    return entities;
  }

  extractBlocks(parsedData: any): any[] {
    if (!parsedData.blocks) {
      return [];
    }

    return Object.keys(parsedData.blocks).map(blockName => ({
      name: blockName,
      entities: parsedData.blocks[blockName].entities,
    }));
  }

  getBounds(entities: any[]): { minX: number; minY: number; maxX: number; maxY: number } {
    if (!entities || entities.length === 0) {
      return { minX: 0, minY: 0, maxX: 0, maxY: 0 };
    }

    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

    entities.forEach(entity => {
      if (entity.vertices) {
        entity.vertices.forEach((v: any) => {
          minX = Math.min(minX, v.x);
          minY = Math.min(minY, v.y);
          maxX = Math.max(maxX, v.x);
          maxY = Math.max(maxY, v.y);
        });
      } else if (entity.startPoint && entity.endPoint) {
        minX = Math.min(minX, entity.startPoint.x, entity.endPoint.x);
        minY = Math.min(minY, entity.startPoint.y, entity.endPoint.y);
        maxX = Math.max(maxX, entity.startPoint.x, entity.endPoint.x);
        maxY = Math.max(maxY, entity.startPoint.y, entity.endPoint.y);
      }
    });

    return { minX, minY, maxX, maxY };
  }
}
