import { IsNotEmpty, IsString, IsNumber, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceDto {
  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Consultoria de Negócios Avançada',
    required: false,
  })
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Descrição detalhada do serviço',
    example: 'Consultoria estratégica premium para empresas em crescimento',
    required: false,
  })
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Preço do serviço em KZ',
    example: 6000,
    minimum: 0,
    required: false,
  })
  @IsNumber()
  @Min(0)
  price?: number;
}
