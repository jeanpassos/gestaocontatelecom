import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const typeOrmConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: '201.91.93.55',
  port: 5432,
  username: 'telefonia',
  password: '6T8Cs8dbNWAN',
  database: 'telefonia',
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: false, // Desabilitado para usar migrações
  ssl: {
    rejectUnauthorized: false,
  },
  logging: true
};
