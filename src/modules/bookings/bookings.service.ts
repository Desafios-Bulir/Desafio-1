import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Booking, BookingStatus } from '@prisma/client';
import { BookingsRepository, BookingWithRelations } from './bookings.repository';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';
import { CreateBookingDto } from './dto';

@Injectable()
export class BookingsService {
  constructor(
    private bookingsRepository: BookingsRepository,
    private usersService: UsersService,
    private servicesService: ServicesService,
    private prisma: PrismaService,
  ) {}

  async createBooking(clientId: string, createBookingDto: CreateBookingDto): Promise<Booking> {
    const service = await this.servicesService.getServiceById(createBookingDto.serviceId);

    const client = await this.usersService.getUserById(clientId);
    if (!client) {
      throw new NotFoundException('Cliente não encontrado');
    }

    if (client.role === 'PROVIDER') {
      throw new BadRequestException('Prestadores de serviço não podem fazer reservas');
    }

    const hasBalance = await this.usersService.validateBalance(clientId, service.price);
    if (!hasBalance) {
      throw new BadRequestException('Saldo insuficiente para fazer esta reserva');
    }

    // Validar data de agendamento (não pode ser no passado)
    const scheduledDate = new Date(createBookingDto.scheduledAt);
    if (scheduledDate < new Date()) {
      throw new BadRequestException('Data de agendamento não pode ser no passado');
    }

    const booking = await this.prisma.$transaction(async (tx) => {
      const newBooking = await tx.booking.create({
        data: {
          clientId,
          serviceId: createBookingDto.serviceId,
          scheduledAt: scheduledDate,
          status: BookingStatus.PENDING,
        },
      });

      await tx.user.update({
        where: { id: clientId },
        data: {
          balance: {
            decrement: service.price,
          },
        },
      });

      await tx.user.update({
        where: { id: service.providerId },
        data: {
          balance: {
            increment: service.price,
          },
        },
      });

      await tx.transaction.create({
        data: {
          fromUserId: clientId,
          toUserId: service.providerId,
          bookingId: newBooking.id,
          amount: service.price,
        },
      });

      return newBooking;
    });

    return booking;
  }

  async getMyBookings(clientId: string): Promise<BookingWithRelations[]> {
    return this.bookingsRepository.findByClientId(clientId);
  }

  async getProviderBookings(providerId: string): Promise<BookingWithRelations[]> {
    return this.bookingsRepository.findByProviderId(providerId);
  }

  async getBookingById(bookingId: string, userId: string): Promise<BookingWithRelations> {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    const isOwner = booking.clientId === userId;
    const isProvider = booking.service.providerId === userId;

    if (!isOwner && !isProvider) {
      throw new ForbiddenException('Você não tem permissão para visualizar esta reserva');
    }

    return booking;
  }

  async cancelBooking(bookingId: string, userId: string): Promise<Booking> {
    const booking = await this.bookingsRepository.findById(bookingId);
    if (!booking) {
      throw new NotFoundException('Reserva não encontrada');
    }

    if (booking.clientId !== userId) {
      throw new ForbiddenException('Apenas o cliente pode cancelar a reserva');
    }

    // Validar se a reserva está pendente
    if (booking.status !== BookingStatus.PENDING) {
      throw new BadRequestException(`Não é possível cancelar uma reserva ${booking.status.toLowerCase()}`);
    }

    const service = booking.service;

    // Usar transação atômica para reembolso
    const canceledBooking = await this.prisma.$transaction(async (tx) => {

      const updated = await tx.booking.update({
        where: { id: bookingId },
        data: { status: BookingStatus.CANCELED },
      });

      // Reembolsar cliente
      await tx.user.update({
        where: { id: booking.clientId },
        data: {
          balance: {
            increment: service.price,
          },
        },
      });

      await tx.user.update({
        where: { id: service.providerId },
        data: {
          balance: {
            decrement: service.price,
          },
        },
      });

      if (booking.transaction) {
        await tx.transaction.delete({
          where: { id: booking.transaction.id },
        });
      }

      return updated;
    });

    return canceledBooking;
  }
}
