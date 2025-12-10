import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MulterModule } from '@nestjs/platform-express';
import { DrawingsService } from './drawings.service';
import { DrawingsController } from './drawings.controller';
import { FileStorageService } from './services/file-storage.service';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { DrawingCategory } from '@/database/entities/drawing-category.entity';
import { DrawingParameter } from '@/database/entities/drawing-parameter.entity';
import { CadModule } from '../cad/cad.module';
import { RulesModule } from '../rules/rules.module';
import { MatchingModule } from '../matching/matching.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      StandardDrawing,
      DrawingCategory,
      DrawingParameter,
    ]),
    MulterModule.register({
      dest: './uploads',
    }),
    CadModule,
    RulesModule,
    MatchingModule,
  ],
  controllers: [DrawingsController],
  providers: [DrawingsService, FileStorageService],
  exports: [DrawingsService],
})
export class DrawingsModule {}
