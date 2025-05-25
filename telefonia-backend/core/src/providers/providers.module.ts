import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProvidersService } from './providers.service';
import { ProvidersController } from './providers.controller';
import { Provider } from './entities/provider.entity';
import { AuthModule } from '../auth/auth.module'; // Import AuthModule se RolesGuard/JwtAuthGuard dependerem dele

@Module({
  imports: [
    TypeOrmModule.forFeature([Provider]),
    AuthModule, // Necessário para JwtAuthGuard e RolesGuard se eles usam serviços do AuthModule
  ],
  controllers: [ProvidersController],
  providers: [ProvidersService],
  exports: [ProvidersService], // Exportar se outros módulos precisarem do ProvidersService
})
export class ProvidersModule {}
