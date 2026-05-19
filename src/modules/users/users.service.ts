import { Injectable, BadRequestException, UnauthorizedException, ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersRepository } from './users.repository';
import { CreateUserDto, LoginDto, CreateClientDto, CreateProviderDto } from './dto';
import { User } from '@prisma/client';
import { isValidNif } from '../../common/utils/nif.validator';

@Injectable()
export class UsersService {
  constructor( private usersRepository: UsersRepository, private jwtService: JwtService) {}

  async registerClient(createClientDto: CreateClientDto): Promise<{ user: User; access_token: string }> {
    const existingEmail = await this.usersRepository.findByEmail(createClientDto.email);
    if (existingEmail) {
      throw new ConflictException('Email já está registrado');
    }

    const hashedPassword = await bcrypt.hash(createClientDto.password, 10);

    const user = await this.usersRepository.create({
      fullName: createClientDto.fullName,
      phone: createClientDto.phone,
      email: createClientDto.email,
      password: hashedPassword,
      role: 'CLIENT',
    });

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

  async registerProvider(createProviderDto: CreateProviderDto): Promise<{ user: User; access_token: string }> {
    
    if (!isValidNif(createProviderDto.nif)) {
      throw new BadRequestException('NIF inválido: deve ter 10 dígitos numéricos e começar com 5');
    }

    const existingEmail = await this.usersRepository.findByEmail(createProviderDto.email);
    if (existingEmail)
      throw new ConflictException('Email já está registrado');
    

    const existingNif = await this.usersRepository.findByNif(createProviderDto.nif);
    if (existingNif)
      throw new ConflictException('NIF já está registrado');


    const hashedPassword = await bcrypt.hash(createProviderDto.password, 10);

    const user = await this.usersRepository.create({
      fullName: createProviderDto.fullName,
      phone: createProviderDto.phone,
      email: createProviderDto.email,
      password: hashedPassword,
      nif: createProviderDto.nif,
      role: 'PROVIDER',
    });

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

  async getUserById(userId: string): Promise<User | null> {
    return this.usersRepository.findById(userId);
  }

  async validateBalance(userId: string, amount: number): Promise<boolean> {
    const user = await this.usersRepository.findById(userId);
    if (!user) {
      return false;
    }
    return user.balance >= amount;
  }
}
