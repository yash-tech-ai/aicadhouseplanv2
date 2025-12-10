import { DataSource } from 'typeorm';
import { config } from 'dotenv';
import { join } from 'path';

config();

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'caduser',
  password: process.env.DB_PASSWORD || 'cadpassword',
  database: process.env.DB_DATABASE || 'cad_house_plan',
  entities: [join(__dirname, '../database/entities/**/*.entity{.ts,.js}')],
  migrations: [join(__dirname, '../database/migrations/**/*{.ts,.js}')],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
});
