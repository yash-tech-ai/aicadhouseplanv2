import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ParameterDefinition } from '@/database/entities/parameter-definition.entity';
import { User } from '@/database/entities/user.entity';
import { StandardDrawing } from '@/database/entities/standard-drawing.entity';
import { Rule } from '@/database/entities/rule.entity';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(ParameterDefinition)
    private paramDefRepository: Repository<ParameterDefinition>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(StandardDrawing)
    private drawingRepository: Repository<StandardDrawing>,
    @InjectRepository(Rule)
    private ruleRepository: Repository<Rule>,
  ) {}

  // Parameter Definitions
  async getParameters(): Promise<ParameterDefinition[]> {
    return this.paramDefRepository.find({
      order: { displayOrder: 'ASC' },
    });
  }

  async createParameter(data: Partial<ParameterDefinition>): Promise<ParameterDefinition> {
    const param = this.paramDefRepository.create(data);
    return this.paramDefRepository.save(param);
  }

  async updateParameter(id: string, data: Partial<ParameterDefinition>): Promise<ParameterDefinition> {
    await this.paramDefRepository.update(id, data);
    return this.paramDefRepository.findOne({ where: { id } });
  }

  async deleteParameter(id: string): Promise<void> {
    await this.paramDefRepository.delete(id);
  }

  // Statistics
  async getStatistics(): Promise<any> {
    const totalUsers = await this.userRepository.count();
    const totalDrawings = await this.drawingRepository.count();
    const totalRules = await this.ruleRepository.count();

    const drawingsByStatus = await this.drawingRepository
      .createQueryBuilder('drawing')
      .select('drawing.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('drawing.status')
      .getRawMany();

    const topDrawings = await this.drawingRepository.find({
      order: { viewCount: 'DESC' },
      take: 10,
      relations: ['category'],
    });

    return {
      totalUsers,
      totalDrawings,
      totalRules,
      drawingsByStatus,
      topDrawings,
    };
  }

  // User Management
  async getUsers(): Promise<User[]> {
    return this.userRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async updateUserRole(userId: string, role: string): Promise<User> {
    await this.userRepository.update(userId, { role: role as any });
    return this.userRepository.findOne({ where: { id: userId } });
  }

  async toggleUserStatus(userId: string): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    await this.userRepository.update(userId, { isActive: !user.isActive });
    return this.userRepository.findOne({ where: { id: userId } });
  }
}
