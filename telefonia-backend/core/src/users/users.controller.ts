import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, UseInterceptors, UploadedFile, BadRequestException, Req } from '@nestjs/common';
import { Request } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Importar UpdateUserDto
import { User, UserRole } from './entities/user.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

// Interface para o Request com usuário autenticado
interface RequestWithUser extends Request {
  user: User;
}

// Estes seriam importados do módulo de autenticação após implementados
// import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
// import { RolesGuard } from '../auth/guards/roles.guard';
// import { Roles } from '../auth/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN, UserRole.SUPERVISOR)
  async findAll(@Query('companyId') companyId?: string) {
    return this.usersService.findAll();
    // TODO: Implementar filtro por companyId
  }

  @Get(':id')
  // @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) { // Usar UpdateUserDto
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Patch(':id/activate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async activate(@Param('id') id: string): Promise<User> {
    return this.usersService.activate(id);
  }

  @Patch(':id/deactivate')
  // @UseGuards(JwtAuthGuard, RolesGuard)
  // @Roles(UserRole.ADMIN)
  async deactivate(@Param('id') id: string): Promise<User> {
    return this.usersService.deactivate(id);
  }
  
  @Post('upload-avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './uploads/avatars',
        filename: (req: any, file, cb) => {
          // Gerar um nome de arquivo único baseado no timestamp e ID do usuário
          // Usar type assertion para acessar o user corretamente
          const userId = (req.user as User)?.id || 'unknown';
          const uniqueSuffix = `${Date.now()}-${userId}`;
          const ext = extname(file.originalname);
          cb(null, `avatar-${uniqueSuffix}${ext}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        // Verificar se o arquivo é uma imagem
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new BadRequestException('Somente arquivos de imagem são permitidos!'), false);
        }
        cb(null, true);
      },
      limits: {
        fileSize: 1024 * 1024 * 2, // 2MB
      },
    }),
  )
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: RequestWithUser) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo de imagem foi enviado!');
    }
    
    // Retornar a URL do arquivo no sistema de arquivos
    const serverUrl = process.env.SERVER_URL || 'http://localhost:3000';
    const avatarUrl = `${serverUrl}/uploads/avatars/${file.filename}`;
    
    // Atualizar o usuário com a nova URL do avatar usando o ID do usuário autenticado
    const userId = req.user.id;
    console.log(`Atualizando avatarUrl do usuário ${userId} para ${avatarUrl}`);
    await this.usersService.updateProfile(userId, { avatarUrl });
    
    return { avatarUrl };
  }
}
