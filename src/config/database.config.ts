import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Note } from '../notes/entities/note.entity';

export function databaseConfig(configService: ConfigService): TypeOrmModuleOptions {
  const nodeEnv = configService.get<string>('NODE_ENV', 'development');

  return {
    type: 'postgres',
    host: configService.get<string>('DB_HOST', 'localhost'),
    port: configService.get<number>('DB_PORT', 5432),
    username: configService.get<string>('DB_USER'),
    password: configService.get<string>('DB_PASSWORD'),
    database: configService.get<string>('DB_NAME'),
    entities: [Note],
    synchronize: nodeEnv !== 'production',
    logging: nodeEnv === 'development',
  };
}
