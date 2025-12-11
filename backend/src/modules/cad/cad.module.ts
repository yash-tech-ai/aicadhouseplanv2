import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { BullModule } from '@nestjs/bullmq';
import { CadService } from './cad.service';
import { CadController } from './cad.controller';
import { CadMetadata, CadMetadataSchema } from '@/database/schemas/cad-metadata.schema';
import { CadProcessorService } from './services/cad-processor.service';
import { ParameterExtractorService } from './services/parameter-extractor.service';
import { CadParserService } from './services/cad-parser.service';
import { ImageProcessorService } from './services/image-processor.service';
import { CadProcessor } from './processors/cad.processor';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CadMetadata.name, schema: CadMetadataSchema },
    ]),
    BullModule.registerQueue({
      name: 'cad-processing',
    }),
  ],
  controllers: [CadController],
  providers: [
    CadService,
    CadProcessorService,
    ParameterExtractorService,
    CadParserService,
    ImageProcessorService,
    CadProcessor,
  ],
  exports: [CadService, ParameterExtractorService, ImageProcessorService],
})
export class CadModule {}
