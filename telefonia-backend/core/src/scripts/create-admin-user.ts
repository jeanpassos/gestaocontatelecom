import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { UsersService } from '../users/users.service';
import { UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';

async function bootstrap() {
  // Inicializa o contexto da aplicação NestJS para podermos usar os serviços
  const application = await NestFactory.createApplicationContext(AppModule);
  const usersService = application.get(UsersService);

  const adminDetails: CreateUserDto = {
    email: 'admin2@demo.com',
    password: 'admin123',
    role: UserRole.ADMIN, // Usa o valor do enum UserRole.ADMIN
    companyId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', // ID da "Empresa Demonstração Ltda" do seed
    // Adicione outros campos do CreateUserDto se forem obrigatórios e não tiverem default
    // phoneNumber: '123456789', // Exemplo se 'phoneNumber' for obrigatório
  };

  try {
    console.log(`Verificando se o usuário ${adminDetails.email} já existe...`);
    const existingUser = await usersService.findByEmail(adminDetails.email);

    if (existingUser) {
      console.log(`Usuário ${adminDetails.email} já existe no banco de dados.`);
      // Opcional: Poderíamos atualizar a senha aqui se desejado, mas por enquanto só informa.
      // Exemplo de atualização (cuidado, isso mudaria a senha do usuário existente):
      // console.log(`Atualizando senha para usuário existente ${adminDetails.email}...`);
      // const hashedPassword = await usersService.hashPassword(adminDetails.password);
      // await usersService.update(existingUser.id, { password: hashedPassword });
      // console.log(`Senha do usuário ${adminDetails.email} atualizada.`);
    } else {
      console.log(`Criando novo usuário: ${adminDetails.email}...`);
      const newUser = await usersService.create(adminDetails);
      console.log(`Usuário ${adminDetails.email} criado com sucesso com ID: ${newUser.id}`);
    }
  } catch (error) {
    console.error('Ocorreu um erro ao tentar criar/verificar o usuário administrador:');
    console.error(error);
  } finally {
    await application.close();
    console.log('Script finalizado.');
  }
}

bootstrap();
