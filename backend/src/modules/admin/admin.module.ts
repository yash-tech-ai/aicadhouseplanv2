import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminService } from './admin.service';
import { AdminController } from './admin.controller';
import { ParameterDefinition } from '@/database/entities/parameter-definition.entity';
import { User } from '@/database/entities/user.entity';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { Rule } from '@/database/entities/rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ParameterDefinition,
      User,
      StandardDrawing,
      Rule,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
