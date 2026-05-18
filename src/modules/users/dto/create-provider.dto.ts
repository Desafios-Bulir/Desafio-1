import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateProviderDto {
  @ApiProperty({
    description: 'Nome completo do prestador de serviço',
    example: 'João Silva Santos',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'NIF (Número de Identificação Fiscal) - Obrigatório e único no sistema',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsString()
  nif: string;

  @ApiProperty({
    description: 'Email do prestador - Único no sistema',
    example: 'prestador@example.com',
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
}
