import { ApiProperty } from '@nestjs/swagger';

export class TransactionResponseDto {
  @ApiProperty({
    description: 'ID da transação',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'ID do usuário que enviou (cliente)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  fromUserId: string;

  @ApiProperty({
    description: 'Email do usuário que enviou',
    example: 'cliente@example.com',
  })
  fromUserEmail: string;

  @ApiProperty({
    description: 'ID do usuário que recebeu (prestador)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  toUserId: string;

  @ApiProperty({
    description: 'Email do usuário que recebeu',
    example: 'prestador@example.com',
  })
  toUserEmail: string;

  @ApiProperty({
    description: 'Valor da transação em KZ',
    example: 5000,
  })
  amount: number;

  @ApiProperty({
    description: 'ID da reserva associada',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  bookingId: string;

  @ApiProperty({
    description: 'Data da transação',
    example: '2026-05-18T19:23:57.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Tipo de movimento (entrada ou saída)',
    example: 'debit',
    enum: ['debit', 'credit'],
  })
  type: 'debit' | 'credit';
}
