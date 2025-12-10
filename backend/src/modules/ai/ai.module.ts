import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiService } from './ai.service';
import { AiController } from './ai.controller';
import { SuggestionEngineService } from './services/suggestion-engine.service';
import { LayoutOptimizerService } from './services/layout-optimizer.service';
import { OpenAiService } from './services/openai.service';
import { CadMetadata, CadMetadataSchema } from '@/database/schemas/cad-metadata.schema';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: CadMetadata.name, schema: CadMetadataSchema },
    ]),
    TypeOrmModule.forFeature([StandardDrawing]),
  ],
  controllers: [AiController],
  providers: [
    AiService,
    SuggestionEngineService,
    LayoutOptimizerService,
    OpenAiService,
  ],
  exports: [AiService],
})
export class AiModule {}
