import { IsNotEmpty, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({
    description: 'ID do serviço a ser reservado',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({
    description: 'Data e hora do agendamento (ISO 8601)',
    example: '2026-05-25T10:30:00Z',
  })
  @IsNotEmpty()
  @IsDateString()
  scheduledAt: string;
}
