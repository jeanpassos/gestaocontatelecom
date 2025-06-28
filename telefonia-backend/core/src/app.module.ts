import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CompaniesModule } from './companies/companies.module';
import { UsersModule } from './users/users.module';
import { InvoicesModule } from './invoices/invoices.module';
import { AuthModule } from './auth/auth.module';
import { SegmentsModule } from './segments/segments.module';
import { ProvidersModule } from './providers/providers.module'; // Import ProvidersModule
import { ContractsModule } from './contracts/contracts.module'; // Import ContractsModule
import { PermissionsModule } from './permissions/permissions.module'; // Import PermissionsModule
import { typeOrmConfig } from './config/typeorm.config';

@Module({
  imports: [
    // Configuração do módulo de configuração para carregar variáveis de ambiente
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    // Configuração do MariaDB usando as variáveis de ambiente
    TypeOrmModule.forRoot(typeOrmConfig),
    CompaniesModule,
    UsersModule,
    InvoicesModule,
    AuthModule,
    SegmentsModule,
    ProvidersModule, // Add ProvidersModule here
    ContractsModule, // Add ContractsModule here
    PermissionsModule, // Add PermissionsModule here
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
