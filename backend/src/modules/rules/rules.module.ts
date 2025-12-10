import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { RulesService } from './rules.service';
import { RulesController } from './rules.controller';
import { RuleEngineService } from './services/rule-engine.service';
import { ValidationService } from './services/validation.service';
import { Rule } from '@/database/entities/rule.entity';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { CadMetadata, CadMetadataSchema } from '@/database/schemas/cad-metadata.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Rule, StandardDrawing]),
    MongooseModule.forFeature([
      { name: CadMetadata.name, schema: CadMetadataSchema },
    ]),
  ],
  controllers: [RulesController],
  providers: [RulesService, RuleEngineService, ValidationService],
  exports: [RulesService, ValidationService],
})
export class RulesModule {}
