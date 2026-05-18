import { IsEmail, IsNotEmpty, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '@prisma/client';
import { IsValidNifFormat } from '../../../common/decorators/is-valid-nif.decorator';

export class CreateUserDto {
  @ApiProperty({
    description: 'Nome completo do usuário',
    example: 'João Silva Santos',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'NIF (Número de Identificação Fiscal) - 10 dígitos numéricos começando com 5 - Obrigatório apenas para prestadores de serviço',
    example: '5123456789',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsValidNifFormat()
  nif?: string;

  @ApiProperty({
    description: 'Email do usuário - Único no sistema',
    example: 'joao@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Senha (mínimo 6 caracteres)',
    example: 'senha123',
    minLength: 6,
  })
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    enum: UserRole,
    example: 'CLIENT',
  })
  @IsEnum(UserRole)
  role: UserRole;
}
