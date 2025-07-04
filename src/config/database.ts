import { DataSource } from 'typeorm';
import { UserData } from '../entities/UserData';
import { BreakfastItem } from '../entities/BreakfastItem';
import { MorningSnackItem } from '../entities/MorningSnackItem';
import { LunchItem } from '../entities/LunchItem';
import { AfternoonSnackItem } from '../entities/AfternoonSnackItem';
import { DinnerItem } from '../entities/DinnerItem';
import { Diet } from '../entities/Diet';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'nutri_online',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [
    UserData,
    BreakfastItem,
    MorningSnackItem,
    LunchItem,
    AfternoonSnackItem,
    DinnerItem,
    Diet,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});