import { Controller, Post, Body, UseGuards, Request, Get, Put, Param } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CreateUserDto } from '../users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginData: { email: string; password: string }) {
    console.log('Recebida tentativa de login:', { email: loginData.email });
    try {
      // Validar o usuário diretamente
      const user = await this.authService.validateUser(loginData.email, loginData.password);
      // Gerar token e retornar dados do usuário
      return this.authService.login(user);
    } catch (error) {
      console.error('Erro ao validar usuário:', error.message);
      // Retornar erro formatado para o cliente
      throw new Error('Falha na autenticação: ' + error.message);
    }
  }

  @Post('register')
  async register(@Body() createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  async getProfile(@Request() req) {
    return req.user;
  }
  
  @UseGuards(JwtAuthGuard)
  @Put('profile')
  async updateProfile(@Request() req, @Body() profileData: any) {
    // Usar o ID do usuário autenticado para atualizar o perfil
    return this.authService.updateProfile(req.user.userId, profileData);
  }
}
