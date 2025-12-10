import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RulesService } from './rules.service';
import { ValidationService } from './services/validation.service';
import { Rule, RuleType } from '@/database/entities/rule.entity';

@ApiTags('rules')
@Controller('rules')
export class RulesController {
  constructor(
    private readonly rulesService: RulesService,
    private readonly validationService: ValidationService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get all rules with optional filters' })
  async findAll(
    @Query('region') region?: string,
    @Query('state') state?: string,
    @Query('ruleType') ruleType?: RuleType,
    @Query('isActive') isActive?: boolean,
  ) {
    return this.rulesService.findAll({ region, state, ruleType, isActive });
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get rule by ID' })
  async findOne(@Param('id') id: string) {
    return this.rulesService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new rule (Admin only)' })
  async create(@Body() ruleData: Partial<Rule>) {
    return this.rulesService.createRule(ruleData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a rule (Admin only)' })
  async update(@Param('id') id: string, @Body() ruleData: Partial<Rule>) {
    return this.rulesService.updateRule(id, ruleData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a rule (Admin only)' })
  async delete(@Param('id') id: string) {
    await this.rulesService.deleteRule(id);
    return { message: 'Rule deleted successfully' };
  }

  @Post('validate/:drawingId')
  @ApiOperation({ summary: 'Validate a drawing against applicable rules' })
  async validateDrawing(@Param('drawingId') drawingId: string) {
    return this.validationService.validateDrawing(drawingId);
  }

  @Get('applicable/:region/:state')
  @ApiOperation({ summary: 'Get applicable rules for a region and state' })
  async getApplicableRules(
    @Param('region') region: string,
    @Param('state') state: string,
    @Query('category') category?: string,
  ) {
    return this.rulesService.findApplicableRules(region, state, category);
  }
}
