import { Controller, Post, Body, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto, LoginDto, CreateClientDto, CreateProviderDto } from './dto';
import { User } from '@prisma/client';

@Controller('auth')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)

  @Post('register/client')
  @HttpCode(HttpStatus.CREATED)
  async registerClient( @Body() createClientDto: CreateClientDto ): Promise<{ user: Partial<User>; access_token: string }> {
    const result = await this.usersService.registerClient(createClientDto);
    return {
      user: result.user,
      access_token: result.access_token,
    };
  }

  @Post('register/provider')
  @HttpCode(HttpStatus.CREATED)
  async registerProvider( @Body() createProviderDto: CreateProviderDto): Promise<{ user: Partial<User>; access_token: string }> {
    const result = await this.usersService.registerProvider(createProviderDto);
    return {
      user: result.user,
      access_token: result.access_token,
    };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login( @Body() loginDto: LoginDto): Promise<{ user: Partial<User>; access_token: string }> {
    const result = await this.usersService.login(loginDto);
    return {
      user: result.user,
      access_token: result.access_token,
    };
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getAall()
  {
    const users = this.usersService;
  }
}
