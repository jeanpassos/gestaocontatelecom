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
    // Validar o usuário diretamente. Se validateUser lançar uma exceção (ex: UnauthorizedException),
    // ela será automaticamente tratada pelo NestJS e retornará o status HTTP apropriado.
    const user = await this.authService.validateUser(loginData.email, loginData.password);
    // Se a validação for bem-sucedida, gerar token e retornar dados do usuário
    return this.authService.login(user);
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
