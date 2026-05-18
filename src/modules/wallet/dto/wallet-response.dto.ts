import { ApiProperty } from '@nestjs/swagger';

export class WalletResponseDto {
  @ApiProperty({
    description: 'Saldo atual em KZ',
    example: 3500,
  })
  balance: number;

  @ApiProperty({
    description: 'ID do usuário',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'Tipo de usuário',
    example: 'CLIENT',
  })
  userRole: string;
}
