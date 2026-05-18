import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto, LoginDto, CreateClientDto, CreateProviderDto } from './dto';
import { User } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor( private usersRepository: UsersRepository, private jwtService: JwtService) {}

  
  async login(loginDto: LoginDto): Promise<{ user: User; access_token: string }> {

    const user = await this.usersRepository.findByEmail(loginDto.email);
    if (!user)
      throw new UnauthorizedException('Email ou senha inválidos');
    

    const passwordMatch = await bcrypt.compare(loginDto.password, user.password);
    if (!passwordMatch)
      throw new UnauthorizedException('Email ou senha inválidos');
    

    const access_token = this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        role: user.role,
      },
      { expiresIn: '24h' },
    );

    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword as User, access_token };
  }

  async findAll()
  {
    const user = await this.usersRepository.findAll();
    return user;
  }

}
