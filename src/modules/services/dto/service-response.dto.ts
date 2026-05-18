import { ApiProperty } from '@nestjs/swagger';

export class ServiceResponseDto {
  @ApiProperty({
    description: 'ID único do serviço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Nome do serviço',
    example: 'Consultoria de Negócios',
  })
  name: string;

  @ApiProperty({
    description: 'Descrição do serviço',
    example: 'Consultoria estratégica para empresas em crescimento',
  })
  description: string;

  @ApiProperty({
    description: 'Preço do serviço em KZ',
    example: 5000,
  })
  price: number;

  @ApiProperty({
    description: 'ID do prestador de serviço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  providerId: string;

  @ApiProperty({
    description: 'Data de criação',
    example: '2026-05-18T19:23:57.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Data de atualização',
    example: '2026-05-18T19:23:57.000Z',
  })
  updatedAt: Date;
}
