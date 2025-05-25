import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Método de validação de usuário usando o banco de dados
  async validateUser(email: string, pass: string): Promise<any> {
    try {
      // Log para debugging
      console.log(`Tentativa de login - Email: ${email}`);
      
      if (!email || !pass) {
        console.error('Email ou senha não fornecidos');
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      // Buscar o usuário no banco de dados
      const user = await this.usersService.findByEmail(email);
      
      if (!user) {
        console.error('Usuário não encontrado');
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      // Verificar a senha
      const isPasswordValid = await bcrypt.compare(pass, user.password);
      
      if (!isPasswordValid) {
        console.error('Senha inválida');
        throw new UnauthorizedException('Credenciais inválidas');
      }
      
      // Não retornar a senha
      const { password, ...result } = user;
      return result;
    } catch (error) {
      console.error('Erro na validação do usuário:', error);
      throw new UnauthorizedException('Falha na autenticação');
    }
  }

  async login(user: any) {
    const payload = { email: user.email, sub: user.id, role: user.role };
    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        name: user.name,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        companyId: user.company?.id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      },
      access_token: this.jwtService.sign(payload),
    };
  }

  async register(createUserDto: any) {
    // O hash da senha é feito no serviço de usuários
    const user = await this.usersService.create(createUserDto);
    return this.login(user);
  }
  
  async updateProfile(userId: string, profileData: any) {
    const updatedUser = await this.usersService.updateProfile(userId, profileData);
    return {
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        role: updatedUser.role,
        name: updatedUser.name,
        phone: updatedUser.phone,
        avatarUrl: updatedUser.avatarUrl,
        companyId: updatedUser.company?.id,
        createdAt: updatedUser.createdAt,
        updatedAt: updatedUser.updatedAt
      }
    };
  }
}
