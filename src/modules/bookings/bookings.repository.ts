import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Booking, BookingStatus } from '@prisma/client';

export interface CreateBookingData {
  clientId: string;
  serviceId: string;
  scheduledAt: Date;
}

export type BookingWithRelations = Booking & {
  service?: any;
  client?: any;
  transaction?: any;
};

@Injectable()
export class BookingsRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateBookingData): Promise<Booking> {
    return this.prisma.booking.create({
      data: {
        clientId: data.clientId,
        serviceId: data.serviceId,
        scheduledAt: data.scheduledAt,
        status: BookingStatus.PENDING,
      },
    });
  }

  async findById(id: string): Promise<BookingWithRelations | null> {
    return this.prisma.booking.findUnique({
      where: { id },
      include: {
        client: true,
        service: true,
        transaction: true,
      },
    });
  }

  async findByClientId(clientId: string): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: { clientId },
      include: {
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProviderId(providerId: string): Promise<BookingWithRelations[]> {
    return this.prisma.booking.findMany({
      where: {
        service: {
          providerId,
        },
      },
      include: {
        client: true,
        service: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(id: string, status: BookingStatus): Promise<Booking> {
    return this.prisma.booking.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<Booking> {
    return this.prisma.booking.delete({
      where: { id },
    });
  }
}
