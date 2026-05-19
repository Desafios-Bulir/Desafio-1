import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ForbiddenException, NotFoundException} from '@nestjs/common';
import { BookingsService } from './bookings.service';
import { BookingsRepository } from './bookings.repository';
import { UsersService } from '../users/users.service';
import { ServicesService } from '../services/services.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BookingStatus } from '@prisma/client';

describe('BookingsService', () => {
  let service: BookingsService;
  let repository: BookingsRepository;
  let usersService: UsersService;
  let servicesService: ServicesService;
  let prismaService: PrismaService;

  const mockBookingsRepository = {
    findByClientId: jest.fn(),
    findByProviderId: jest.fn(),
    findById: jest.fn(),
    create: jest.fn(),
    updateStatus: jest.fn(),
  };

  const mockUsersService = {
    getUserById: jest.fn(),
    validateBalance: jest.fn(),
  };

  const mockServicesService = {
    getServiceById: jest.fn(),
  };

  const mockPrismaService = {
    $transaction: jest.fn(),
  };

  const mockClientId = 'client-123';
  const mockProviderId = 'provider-456';
  const mockServiceId = 'service-789';
  const mockBookingId = 'booking-000';

  const mockClient = {
    id: mockClientId,
    fullName: 'Cliente Teste',
    email: 'cliente@example.com',
    password: 'hashed-password',
    balance: 5000,
    role: 'CLIENT',
    nif: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProvider = {
    id: mockProviderId,
    fullName: 'Prestador Teste',
    email: 'prestador@example.com',
    password: 'hashed-password',
    balance: 0,
    role: 'PROVIDER',
    nif: '5123456789',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockService = {
    id: mockServiceId,
    name: 'Serviço de Limpeza',
    description: 'Limpeza residencial',
    price: 2000,
    providerId: mockProviderId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockBooking = {
    id: mockBookingId,
    clientId: mockClientId,
    serviceId: mockServiceId,
    scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Amanhã
    status: BookingStatus.PENDING,
    createdAt: new Date(),
    updatedAt: new Date(),
    service: mockService,
    transaction: {
      id: 'tx-123',
      fromUserId: mockClientId,
      toUserId: mockProviderId,
      bookingId: mockBookingId,
      amount: 2000,
      createdAt: new Date(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BookingsService,
        {
          provide: BookingsRepository,
          useValue: mockBookingsRepository,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
        {
          provide: ServicesService,
          useValue: mockServicesService,
        },
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<BookingsService>(BookingsService);
    repository = module.get<BookingsRepository>(BookingsRepository);
    usersService = module.get<UsersService>(UsersService);
    servicesService = module.get<ServicesService>(ServicesService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString();
    const createBookingDto = {
      serviceId: mockServiceId,
      scheduledAt: futureDate,
    };

    it('deve criar uma reserva com sucesso', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.getUserById.mockResolvedValue(mockClient);
      mockUsersService.validateBalance.mockResolvedValue(true);

      const newBooking = {
        ...mockBooking,
        service: undefined,
        transaction: undefined,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          booking: {
            create: jest.fn().mockResolvedValue(newBooking),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          transaction: {
            create: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await service.createBooking(mockClientId, createBookingDto);

      expect(result).toBeDefined();
    });

    it('deve lançar NotFoundException se o serviço não existir', async () => {
      mockServicesService.getServiceById.mockRejectedValue(
        new NotFoundException('Serviço não encontrado'),
      );

      await expect(
        service.createBooking(mockClientId, createBookingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException se o cliente não existir', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.getUserById.mockResolvedValue(null);

      await expect(
        service.createBooking(mockClientId, createBookingDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar BadRequestException se o cliente é um prestador', async () => {
      const providerClient = { ...mockClient, role: 'PROVIDER' };
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.getUserById.mockResolvedValue(providerClient);

      await expect(
        service.createBooking(mockClientId, createBookingDto),
      ).rejects.toThrow(
        new BadRequestException(
          'Prestadores de serviço não podem fazer reservas',
        ),
      );
    });

    it('deve lançar BadRequestException se o saldo é insuficiente', async () => {
      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.getUserById.mockResolvedValue(mockClient);
      mockUsersService.validateBalance.mockResolvedValue(false);

      await expect(
        service.createBooking(mockClientId, createBookingDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se a data é no passado', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      const dtoWithPastDate = { ...createBookingDto, scheduledAt: pastDate };

      mockServicesService.getServiceById.mockResolvedValue(mockService);
      mockUsersService.getUserById.mockResolvedValue(mockClient);
      mockUsersService.validateBalance.mockResolvedValue(true);

      await expect(
        service.createBooking(mockClientId, dtoWithPastDate),
      ).rejects.toThrow(
        new BadRequestException('Data de agendamento não pode ser no passado'),
      );
    });
  });

  describe('getMyBookings', () => {
    it('deve retornar as reservas do cliente', async () => {
      const bookings = [mockBooking, { ...mockBooking, id: 'booking-001' }];
      mockBookingsRepository.findByClientId.mockResolvedValue(bookings);

      const result = await service.getMyBookings(mockClientId);

      expect(result).toEqual(bookings);
      expect(mockBookingsRepository.findByClientId).toHaveBeenCalledWith(
        mockClientId,
      );
    });

    it('deve retornar lista vazia se o cliente não tem reservas', async () => {
      mockBookingsRepository.findByClientId.mockResolvedValue([]);

      const result = await service.getMyBookings(mockClientId);

      expect(result).toEqual([]);
    });
  });

  describe('getProviderBookings', () => {
    it('deve retornar as reservas do prestador', async () => {
      const bookings = [mockBooking];
      mockBookingsRepository.findByProviderId.mockResolvedValue(bookings);

      const result = await service.getProviderBookings(mockProviderId);

      expect(result).toEqual(bookings);
      expect(mockBookingsRepository.findByProviderId).toHaveBeenCalledWith(
        mockProviderId,
      );
    });

    it('deve retornar lista vazia se o prestador não tem reservas', async () => {
      mockBookingsRepository.findByProviderId.mockResolvedValue([]);

      const result = await service.getProviderBookings(mockProviderId);

      expect(result).toEqual([]);
    });
  });

  describe('getBookingById', () => {
    it('deve retornar a reserva se o usuário é o cliente', async () => {
      mockBookingsRepository.findById.mockResolvedValue(mockBooking);

      const result = await service.getBookingById(mockBookingId, mockClientId);

      expect(result).toEqual(mockBooking);
    });

    it('deve retornar a reserva se o usuário é o prestador', async () => {
      mockBookingsRepository.findById.mockResolvedValue(mockBooking);

      const result = await service.getBookingById(mockBookingId, mockProviderId);

      expect(result).toEqual(mockBooking);
    });

    it('deve lançar ForbiddenException se o usuário não é cliente ou prestador', async () => {
      const otherId = 'other-user-id';
      mockBookingsRepository.findById.mockResolvedValue(mockBooking);

      await expect(
        service.getBookingById(mockBookingId, otherId),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar NotFoundException se a reserva não existir', async () => {
      mockBookingsRepository.findById.mockResolvedValue(null);

      await expect(
        service.getBookingById(mockBookingId, mockClientId),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('cancelBooking', () => {
    it('deve cancelar a reserva e processar reembolso', async () => {
      mockBookingsRepository.findById.mockResolvedValue(mockBooking);

      const canceledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELED,
      };

      mockPrismaService.$transaction.mockImplementation(async (callback) => {
        const tx = {
          booking: {
            update: jest.fn().mockResolvedValue(canceledBooking),
          },
          user: {
            update: jest.fn().mockResolvedValue({}),
          },
          transaction: {
            delete: jest.fn().mockResolvedValue({}),
          },
        };
        return callback(tx);
      });

      const result = await service.cancelBooking(mockBookingId, mockClientId);

      expect(result.status).toBe(BookingStatus.CANCELED);
    });

    it('deve lançar NotFoundException se a reserva não existir', async () => {
      mockBookingsRepository.findById.mockResolvedValue(null);

      await expect(
        service.cancelBooking(mockBookingId, mockClientId),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o usuário não é o cliente', async () => {
      mockBookingsRepository.findById.mockResolvedValue(mockBooking);

      await expect(
        service.cancelBooking(mockBookingId, 'other-user-id'),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException se a reserva não está PENDING', async () => {
      const canceledBooking = {
        ...mockBooking,
        status: BookingStatus.CANCELED,
      };

      mockBookingsRepository.findById.mockResolvedValue(canceledBooking);

      await expect(
        service.cancelBooking(mockBookingId, mockClientId),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException se a reserva está em outro status', async () => {
      const completedBooking = {
        ...mockBooking,
        status: BookingStatus.COMPLETED,
      };

      mockBookingsRepository.findById.mockResolvedValue(completedBooking);

      await expect(
        service.cancelBooking(mockBookingId, mockClientId),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
