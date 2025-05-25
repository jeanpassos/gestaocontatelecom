import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UsersService } from '../../users/users.service';
import { jwtConstants } from '../constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private usersService: UsersService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: jwtConstants.secret,
    });
  }

  async validate(payload: any) {
    console.log('[JwtStrategy] Iniciando validação do payload do token:', JSON.stringify(payload));
    if (!payload || !payload.sub) {
      console.error('[JwtStrategy] Payload do token inválido ou sem "sub" (ID do usuário).');
      throw new UnauthorizedException('Token inválido: payload.sub ausente.');
    }

    console.log('[JwtStrategy] Buscando usuário com ID (payload.sub): ' + payload.sub);
    const user = await this.usersService.findOne(payload.sub);
    
    if (!user) {
      console.error('[JwtStrategy] Usuário com ID ' + payload.sub + ' não encontrado no banco.');
      throw new UnauthorizedException('Usuário do token não encontrado.');
    }
    console.log('[JwtStrategy] Usuário encontrado: ID=' + user.id + ', Email=' + user.email + ', Active=' + user.active);

    if (!user.active) {
      console.error('[JwtStrategy] Usuário ' + user.email + ' está inativo.');
      throw new UnauthorizedException('Usuário inativo.');
    }
    
    console.log('[JwtStrategy] Validação bem-sucedida para usuário: ' + user.email);
    // Não incluir a senha no objeto retornado para ser anexado ao Request
    const { password, ...result } = user;
    return result;
  }
}
