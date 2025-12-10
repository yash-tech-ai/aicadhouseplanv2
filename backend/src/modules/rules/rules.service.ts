import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Rule, RuleType } from '@/database/entities/rule.entity';

@Injectable()
export class RulesService {
  constructor(
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
  ) {}

  async createRule(ruleData: Partial<Rule>): Promise<Rule> {
    const rule = this.ruleRepository.create(ruleData);
    return this.ruleRepository.save(rule);
  }

  async updateRule(id: string, ruleData: Partial<Rule>): Promise<Rule> {
    await this.ruleRepository.update(id, ruleData);
    return this.ruleRepository.findOne({ where: { id } });
  }

  async deleteRule(id: string): Promise<void> {
    await this.ruleRepository.delete(id);
  }

  async findById(id: string): Promise<Rule> {
    return this.ruleRepository.findOne({ where: { id } });
  }

  async findAll(filters?: {
    region?: string;
    state?: string;
    ruleType?: RuleType;
    isActive?: boolean;
  }): Promise<Rule[]> {
    const query = this.ruleRepository.createQueryBuilder('rule');

    if (filters?.region) {
      query.andWhere('rule.region = :region', { region: filters.region });
    }

    if (filters?.state) {
      query.andWhere('rule.state = :state', { state: filters.state });
    }

    if (filters?.ruleType) {
      query.andWhere('rule.ruleType = :ruleType', { ruleType: filters.ruleType });
    }

    if (filters?.isActive !== undefined) {
      query.andWhere('rule.isActive = :isActive', { isActive: filters.isActive });
    }

    query.orderBy('rule.priority', 'DESC');

    return query.getMany();
  }

  async findApplicableRules(region: string, state: string, category?: string): Promise<Rule[]> {
    const query = this.ruleRepository.createQueryBuilder('rule')
      .where('rule.isActive = :isActive', { isActive: true })
      .andWhere('(rule.region = :region OR rule.region IS NULL)', { region })
      .andWhere('(rule.state = :state OR rule.state IS NULL)', { state });

    if (category) {
      query.andWhere(
        '(rule.applicableCategory = :category OR rule.applicableCategory IS NULL)',
        { category },
      );
    }

    query.orderBy('rule.priority', 'DESC');

    return query.getMany();
  }
}
