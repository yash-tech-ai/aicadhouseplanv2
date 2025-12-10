import { Injectable } from '@nestjs/common';
import { CadParserService } from './cad-parser.service';
import { ParameterExtractorService } from './parameter-extractor.service';

@Injectable()
export class CadProcessorService {
  constructor(
    private cadParserService: CadParserService,
    private parameterExtractorService: ParameterExtractorService,
  ) {}

  async processFile(filePath: string): Promise<any> {
    // Parse the CAD file
    const parsedData = await this.cadParserService.parseDXF(filePath);

    // Extract layers
    const layers = this.cadParserService.extractLayers(parsedData);

    // Extract entities
    const entities = this.cadParserService.extractEntities(parsedData);

    // Extract blocks
    const blocks = this.cadParserService.extractBlocks(parsedData);

    // Extract parameters
    const parameters = await this.parameterExtractorService.extractParameters(parsedData);

    // Compute features
    const computedFeatures = this.parameterExtractorService.computeFeatures(parsedData, parameters);

    // Get geometric bounds
    const bounds = this.cadParserService.getBounds(entities);

    return {
      extractedData: {
        entities,
        layers,
        blocks,
        header: parsedData.header,
      },
      parameters,
      computedFeatures,
      geometricData: {
        bounds,
        centroid: {
          x: (bounds.minX + bounds.maxX) / 2,
          y: (bounds.minY + bounds.maxY) / 2,
        },
      },
      processingStatus: 'completed',
    };
  }
}
