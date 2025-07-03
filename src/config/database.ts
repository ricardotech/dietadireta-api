import { DataSource } from 'typeorm';
import { User } from '../entities/User';
import { BodyMeasurements } from '../entities/BodyMeasurements';
import { UserActivity } from '../entities/UserActivity';
import { BreakfastItem } from '../entities/BreakfastItem';
import { UserBreakfast } from '../entities/UserBreakfast';
import { MorningSnackItem } from '../entities/MorningSnackItem';
import { UserMorningSnack } from '../entities/UserMorningSnack';
import { LunchItem } from '../entities/LunchItem';
import { UserLunch } from '../entities/UserLunch';
import { AfternoonSnackItem } from '../entities/AfternoonSnackItem';
import { UserAfternoonSnack } from '../entities/UserAfternoonSnack';
import { DinnerItem } from '../entities/DinnerItem';
import { UserDinner } from '../entities/UserDinner';

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
    User,
    BodyMeasurements,
    UserActivity,
    BreakfastItem,
    UserBreakfast,
    MorningSnackItem,
    UserMorningSnack,
    LunchItem,
    UserLunch,
    AfternoonSnackItem,
    UserAfternoonSnack,
    DinnerItem,
    UserDinner,
  ],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts'],
});