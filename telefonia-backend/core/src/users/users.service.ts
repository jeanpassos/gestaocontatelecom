import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User, UserRole } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto'; // Importar UpdateUserDto

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Verificar se o e-mail já existe
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email já está em uso');
    }

    // Hash da senha
    const hashedPassword = await this.hashPassword(createUserDto.password);

    // Criar o usuário
    const user = this.usersRepository.create({
      ...createUserDto,
      password: hashedPassword,
      company: { id: createUserDto.companyId },
    });

    return this.usersRepository.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      relations: ['company'],
      select: [
        'id', 
        'email', 
        'role', 
        'name', 
        'phone', 
        'avatarUrl', 
        'createdAt', 
        'updatedAt', 
        'company',
        'active' // Adicionar active
      ]
    });
  }

  async findOne(id: string): Promise<User> {
    // findOne sem select explícito já deve trazer todos os campos da entidade, incluindo 'active'
    // mas para garantir consistência com findAll e findByEmail, podemos adicionar select aqui também se quisermos.
    // Por ora, vamos assumir que ele já traz 'active'.
    const user = await this.usersRepository.findOne({
      where: { id },
      relations: ['company'], 
    });

    if (!user) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }

    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email },
      relations: ['company'],
      select: [
        'id', 
        'email', 
        'password', // Necessário para autenticação
        'role', 
        'name',
        'phone', 
        'avatarUrl', 
        'createdAt', 
        'updatedAt',
        'active' // Adicionar active
      ]
    });
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> { // Usar UpdateUserDto
    await this.findOne(id); // Verificar se existe

    // Se estiver atualizando a senha, hash dela
    if (updateUserDto.password) {
      updateUserDto.password = await this.hashPassword(updateUserDto.password);
    }
    
    // A coluna 'updatedAt' é atualizada automaticamente pelo TypeORM (@UpdateDateColumn)
    // então não precisamos definir manualmente.

    // Prepara o payload para atualização, tratando companyId separadamente
    const { companyId, ...restOfDto } = updateUserDto;
    const payloadToUpdate: any = { ...restOfDto };

    if (companyId) {
      payloadToUpdate.company = { id: companyId };
    }
    
    await this.usersRepository.update(id, payloadToUpdate);

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
  }

  // Método para atualizar o perfil do usuário
  async updateProfile(id: string, profileData: any): Promise<User> {
    const user = await this.findOne(id);
    
    // Verificar se está alterando a senha
    if (profileData.currentPassword && profileData.newPassword) {
      // Verificar se a senha atual está correta
      const isPasswordValid = await bcrypt.compare(profileData.currentPassword, user.password);
      if (!isPasswordValid) {
        throw new BadRequestException('Senha atual incorreta');
      }
      
      // Atualizar para a nova senha
      profileData.password = await this.hashPassword(profileData.newPassword);
      
      // Remover os campos temporários
      delete profileData.currentPassword;
      delete profileData.newPassword;
    }
    
    // Atualizar os campos do perfil
    return this.update(id, profileData);
  }
  
  // Método para criar um usuário admin inicial (seed)
  async createInitialAdmin(email: string, password: string, companyId: string): Promise<User> {
    const existingAdmin = await this.usersRepository.findOne({
      where: { role: UserRole.ADMIN },
    });

    if (existingAdmin) {
      throw new BadRequestException('Um administrador já existe no sistema');
    }

    const adminData: CreateUserDto = {
      email,
      password,
      role: UserRole.ADMIN,
      companyId,
    };

    return this.create(adminData);
  }

  async activate(id: string): Promise<User> {
    await this.usersRepository.update(id, { active: true });
    return this.findOne(id);
  }

  async deactivate(id: string): Promise<User> {
    await this.usersRepository.update(id, { active: false });
    return this.findOne(id);
  }
}
