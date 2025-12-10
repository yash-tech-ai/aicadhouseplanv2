import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import * as path from 'path';
import { User, UserRole } from '../entities/user.entity';
import { DrawingCategory } from '../entities/drawing-category.entity';
import { Rule, RuleType } from '../entities/rule.entity';
import { ParameterDefinition, ParameterDataType } from '../entities/parameter-definition.entity';
import * as bcrypt from 'bcrypt';

config({ path: path.join(__dirname, '../../../.env') });

const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  entities: [path.join(__dirname, '../entities/*.entity.{ts,js}')],
  synchronize: true,
});

async function seed() {
  await AppDataSource.initialize();

  console.log('🌱 Seeding database...');

  // Seed Users
  const userRepository = AppDataSource.getRepository(User);

  const adminExists = await userRepository.findOne({ where: { email: 'admin@cad.com' } });

  if (!adminExists) {
    const admin = userRepository.create({
      email: 'admin@cad.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      isActive: true,
    });
    await userRepository.save(admin);
    console.log('✓ Admin user created (admin@cad.com / admin123)');
  }

  const architectExists = await userRepository.findOne({ where: { email: 'architect@cad.com' } });

  if (!architectExists) {
    const architect = userRepository.create({
      email: 'architect@cad.com',
      password: await bcrypt.hash('architect123', 10),
      firstName: 'Head',
      lastName: 'Architect',
      role: UserRole.HEAD_ARCHITECT,
      organization: 'CAD Architecture Firm',
      licenseNumber: 'ARCH-2024-001',
      isActive: true,
    });
    await userRepository.save(architect);
    console.log('✓ Head Architect user created (architect@cad.com / architect123)');
  }

  // Seed Categories
  const categoryRepository = AppDataSource.getRepository(DrawingCategory);

  const residentialExists = await categoryRepository.findOne({ where: { name: 'Residential' } });

  if (!residentialExists) {
    const residential = categoryRepository.create({
      name: 'Residential',
      description: 'Residential building plans',
      order: 1,
    });
    await categoryRepository.save(residential);

    const subCategories = [
      { name: '1 BHK', description: '1 Bedroom Hall Kitchen', parent: residential },
      { name: '2 BHK', description: '2 Bedroom Hall Kitchen', parent: residential },
      { name: '3 BHK', description: '3 Bedroom Hall Kitchen', parent: residential },
      { name: 'Villa', description: 'Independent villas and bungalows', parent: residential },
    ];

    for (const cat of subCategories) {
      await categoryRepository.save(categoryRepository.create(cat));
    }

    console.log('✓ Residential categories created');
  }

  const commercialExists = await categoryRepository.findOne({ where: { name: 'Commercial' } });

  if (!commercialExists) {
    const commercial = categoryRepository.create({
      name: 'Commercial',
      description: 'Commercial building plans',
      order: 2,
    });
    await categoryRepository.save(commercial);

    const subCategories = [
      { name: 'Office Space', description: 'Office building plans', parent: commercial },
      { name: 'Retail', description: 'Retail and shop plans', parent: commercial },
      { name: 'Restaurant', description: 'Restaurant and cafe plans', parent: commercial },
    ];

    for (const cat of subCategories) {
      await categoryRepository.save(categoryRepository.create(cat));
    }

    console.log('✓ Commercial categories created');
  }

  // Seed Parameter Definitions
  const paramRepository = AppDataSource.getRepository(ParameterDefinition);

  const parameters = [
    {
      name: 'plot_length',
      displayName: 'Plot Length',
      description: 'Length of the plot',
      dataType: ParameterDataType.NUMERIC,
      unit: 'meters',
      isRequired: true,
      isAutoExtracted: true,
      category: 'Plot Dimensions',
      displayOrder: 1,
    },
    {
      name: 'plot_width',
      displayName: 'Plot Width',
      description: 'Width of the plot',
      dataType: ParameterDataType.NUMERIC,
      unit: 'meters',
      isRequired: true,
      isAutoExtracted: true,
      category: 'Plot Dimensions',
      displayOrder: 2,
    },
    {
      name: 'plot_area',
      displayName: 'Plot Area',
      description: 'Total plot area',
      dataType: ParameterDataType.NUMERIC,
      unit: 'sq.m',
      isRequired: true,
      isAutoExtracted: true,
      category: 'Plot Dimensions',
      displayOrder: 3,
    },
    {
      name: 'num_bedrooms',
      displayName: 'Number of Bedrooms',
      description: 'Total number of bedrooms',
      dataType: ParameterDataType.NUMERIC,
      isRequired: true,
      isAutoExtracted: true,
      category: 'Room Configuration',
      displayOrder: 10,
    },
    {
      name: 'num_bathrooms',
      displayName: 'Number of Bathrooms',
      description: 'Total number of bathrooms',
      dataType: ParameterDataType.NUMERIC,
      isRequired: true,
      isAutoExtracted: true,
      category: 'Room Configuration',
      displayOrder: 11,
    },
    {
      name: 'built_up_area',
      displayName: 'Built-up Area',
      description: 'Total built-up area',
      dataType: ParameterDataType.NUMERIC,
      unit: 'sq.m',
      isRequired: true,
      isAutoExtracted: false,
      category: 'Areas',
      displayOrder: 20,
    },
    {
      name: 'open_space_percentage',
      displayName: 'Open Space Percentage',
      description: 'Percentage of open space',
      dataType: ParameterDataType.NUMERIC,
      unit: '%',
      isRequired: true,
      isAutoExtracted: false,
      category: 'Areas',
      displayOrder: 21,
    },
    {
      name: 'setback_front',
      displayName: 'Front Setback',
      description: 'Front setback distance',
      dataType: ParameterDataType.NUMERIC,
      unit: 'meters',
      isRequired: true,
      isAutoExtracted: true,
      category: 'Setbacks',
      displayOrder: 30,
    },
    {
      name: 'setback_rear',
      displayName: 'Rear Setback',
      description: 'Rear setback distance',
      dataType: ParameterDataType.NUMERIC,
      unit: 'meters',
      isRequired: true,
      isAutoExtracted: true,
      category: 'Setbacks',
      displayOrder: 31,
    },
  ];

  for (const param of parameters) {
    const exists = await paramRepository.findOne({ where: { name: param.name } });
    if (!exists) {
      await paramRepository.save(paramRepository.create(param));
    }
  }

  console.log('✓ Parameter definitions created');

  // Seed Rules
  const ruleRepository = AppDataSource.getRepository(Rule);

  const rules = [
    {
      name: 'Maharashtra Residential Setback - Front',
      description: 'Minimum front setback requirement for residential buildings in Maharashtra',
      region: 'India',
      state: 'Maharashtra',
      ruleType: RuleType.SETBACK,
      priority: 10,
      ruleConfig: {
        conditions: [
          {
            parameter: 'setback_front',
            operator: '>=',
            value: 3,
            message: 'Front setback must be at least 3 meters for residential buildings',
          },
        ],
      },
    },
    {
      name: 'Maharashtra Open Space Requirement',
      description: 'Minimum open space requirement for residential buildings',
      region: 'India',
      state: 'Maharashtra',
      ruleType: RuleType.OPEN_SPACE,
      priority: 9,
      ruleConfig: {
        formula: {
          expression: '(plot_area - built_up_area) / plot_area * 100',
          min_value: 25,
        },
        suggestions: [
          'Reduce built-up area to meet open space requirement',
          'Ensure minimum 25% open space is maintained',
        ],
      },
    },
    {
      name: 'General FAR Limit',
      description: 'Floor Area Ratio limit for residential buildings',
      region: 'India',
      state: 'Maharashtra',
      ruleType: RuleType.FAR,
      priority: 8,
      ruleConfig: {
        conditions: [
          {
            parameter: 'far_consumed',
            operator: '<=',
            value: 1.5,
            message: 'FAR should not exceed 1.5 for residential areas',
          },
        ],
      },
    },
  ];

  for (const rule of rules) {
    const exists = await ruleRepository.findOne({ where: { name: rule.name } });
    if (!exists) {
      await ruleRepository.save(ruleRepository.create(rule));
    }
  }

  console.log('✓ Rules created');

  console.log('\n✅ Seed completed successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('   Admin: admin@cad.com / admin123');
  console.log('   Architect: architect@cad.com / architect123');

  await AppDataSource.destroy();
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error);
  process.exit(1);
});
