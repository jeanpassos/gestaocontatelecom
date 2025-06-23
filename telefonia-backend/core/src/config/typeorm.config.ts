import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'mariadb',
  host: process.env.DB_HOST || '201.91.93.55',
  port: parseInt(process.env.DB_PORT || '3306'),
  username: process.env.DB_USERNAME || 'telefonia',
  password: process.env.DB_PASSWORD || 'ZHADyZKreJLjh6RM',
  database: process.env.DB_DATABASE || 'telefonia',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Desabilitado para usar migrações
  ssl: {
    rejectUnauthorized: false,
  },
  logging: true
};
