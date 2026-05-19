import { IsNotEmpty, IsString, MinLength, IsEmail } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { IsValidNifFormat } from '../../../common/decorators/is-valid-nif.decorator';

export class CreateProviderDto {
  @ApiProperty({
    description: 'Nome completo do prestador de serviço',
    example: 'Gilson Chipombo',
  })
  @IsNotEmpty()
  @IsString()
  fullName: string;

  @ApiProperty({
    description: 'Telefone do prestador',
    example: '923123456',
  })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({
    description:
      'NIF (Número de Identificação Fiscal) - 10 dígitos numéricos começando com 5 - Único no sistema',
    example: '5123456789',
  })
  @IsNotEmpty()
  @IsString()
  @IsValidNifFormat()
  nif: string;

  @ApiProperty({
    description: 'Email do prestador - Único no sistema',
    example: 'prestador@bulir.com',
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
