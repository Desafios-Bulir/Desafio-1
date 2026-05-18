import { ApiProperty } from '@nestjs/swagger';

export class BookingResponseDto {
  @ApiProperty({
    description: 'ID único da reserva',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Status da reserva',
    example: 'PENDING',
    enum: ['PENDING', 'COMPLETED', 'CANCELED'],
  })
  status: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  clientId: string;

  @ApiProperty({
    description: 'ID do serviço',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  serviceId: string;

  @ApiProperty({
    description: 'Data e hora agendada para a reserva',
    example: '2026-05-25T10:30:00Z',
  })
  scheduledAt: Date;

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
