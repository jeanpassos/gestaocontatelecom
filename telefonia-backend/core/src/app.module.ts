import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { SegmentsModule } from './segments/segments.module';
import { ProvidersModule } from './providers/providers.module'; // Import ProvidersModule
import { ContractsModule } from './contracts/contracts.module'; // Import ContractsModule

@Module({
  imports: [
    // Configuração do PostgreSQL sem sincronização de tabelas
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: '201.91.93.55',
      port: 5432,
      username: 'telefonia',
      password: '6T8Cs8dbNWAN',
      database: 'telefonia',
      schema: 'telefonia', // Usar o esquema telefonia que criamos
      entities: [__dirname + '/**/*.entity{.ts,.js}'],
      synchronize: false, // Desativado pois o usuário não tem permissão para criar tabelas
      ssl: false,
      autoLoadEntities: true,
      logging: true
    }),
    CompaniesModule,
    UsersModule,
    InvoicesModule,
    AuthModule,
    SegmentsModule,
    ProvidersModule, // Add ProvidersModule here
    ContractsModule, // Add ContractsModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
