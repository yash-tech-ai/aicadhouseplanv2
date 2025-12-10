import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { MatchingService } from './matching.service';
import { MatchingController } from './matching.controller';
import { MatchingAlgorithmService } from './services/matching-algorithm.service';
import { SimilarityCalculatorService } from './services/similarity-calculator.service';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { DrawingParameter } from '@/database/entities/drawing-parameter.entity';
import { CadMetadata, CadMetadataSchema } from '@/database/schemas/cad-metadata.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([StandardDrawing, DrawingParameter]),
    MongooseModule.forFeature([
      { name: CadMetadata.name, schema: CadMetadataSchema },
    ]),
  ],
  controllers: [MatchingController],
  providers: [
    MatchingService,
    MatchingAlgorithmService,
    SimilarityCalculatorService,
  ],
  exports: [MatchingService],
})
export class MatchingModule {}
