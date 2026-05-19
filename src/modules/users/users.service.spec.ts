import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs');

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;
  let jwtService: JwtService;

  const mockUsersRepository = {
    findByEmail: jest.fn(),
    findByPhone: jest.fn(),
    findByNif: jest.fn(),
    findById: jest.fn(),
    findAll: jest.fn(),
    create: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    fullName: 'Gilson Chipombo',
    phone: '923123456',
    email: 'gilson@gmail.com',
    password: 'hashed-password',
    balance: 4000,
    role: 'CLIENT',
    nif: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockUsersRepository,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('registerClient', () => {
    it('deve registrar um cliente com sucesso', async () => {
      const createClientDto = {
        fullName: 'Maria Santos',
        phone: '923123456',
        email: 'maria@gmail.com',
        password: '123456',
      };

      const newUser = {
        ...mockUser,
        fullName: createClientDto.fullName,
        email: createClientDto.email,
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersRepository.create.mockResolvedValue(newUser);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.registerClient(createClientDto);

      expect(result.user).toEqual({
        id: newUser.id,
        fullName: newUser.fullName,
        phone: newUser.phone,
        email: newUser.email,
        balance: newUser.balance,
        role: 'CLIENT',
        nif: null,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      });
      expect(result.access_token).toBe('jwt-token');
      expect(mockUsersRepository.findByEmail).toHaveBeenCalledWith(createClientDto.email);
    });

    it('deve lançar ConflictException se email já existir', async () => {
      const createClientDto = {
        fullName: 'Maria Santos',
        phone: '923123456',
        email: 'existing@example.com',
        password: '123456',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.registerClient(createClientDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar ConflictException se telefone já existir', async () => {
      const createClientDto = {
        fullName: 'Maria Santos',
        phone: '923123456',
        email: 'maria@gmail.com',
        password: '123456',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.findByPhone.mockResolvedValue(mockUser);

      await expect(service.registerClient(createClientDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve criar cliente com balance inicial 4000 KZ', async () => {
      const createClientDto = {
        fullName: 'Cliente Novo',
        phone: '923123456',
        email: 'bulir@gmail.com',
        password: '123456',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.findByPhone.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersRepository.create.mockResolvedValue({ ...mockUser, balance: 4000 });
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.registerClient(createClientDto);

      expect(result.user.balance).toBe(4000);
    });
  });

  describe('registerProvider', () => {
    it('deve registrar um prestador com sucesso', async () => {
      const createProviderDto = {
        fullName: 'João Prestador',
        phone: '923987654',
        email: 'provider@gmail.com',
        password: '123456',
        nif: '5123456789',
      };

      const newProvider = {
        ...mockUser,
        fullName: createProviderDto.fullName,
        email: createProviderDto.email,
        nif: createProviderDto.nif,
        role: 'PROVIDER',
        balance: 0,
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.findByPhone.mockResolvedValue(null);
      mockUsersRepository.findByNif.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');
      mockUsersRepository.create.mockResolvedValue(newProvider);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.registerProvider(createProviderDto);

      expect(result.user.role).toBe('PROVIDER');
      expect(result.user.balance).toBe(0);
      expect(result.user.nif).toBe(createProviderDto.nif);
    });

    it('deve lançar BadRequestException com NIF inválido', async () => {
      const createProviderDto = {
        fullName: 'João Prestador',
        phone: '923987654',
        email: 'provider@gmail.com',
        password: '123456',
        nif: '1234567890', // NIF inválido (não começa com 5)
      };

      await expect(service.registerProvider(createProviderDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('deve lançar ConflictException se email já existir', async () => {
      const createProviderDto = {
        fullName: 'João Prestador',
        phone: '923987654',
        email: 'existing@gmail.com',
        password: '123456',
        nif: '5123456789',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);

      await expect(service.registerProvider(createProviderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar ConflictException se telefone já existir', async () => {
      const createProviderDto = {
        fullName: 'João Prestador',
        phone: '923987654',
        email: 'provider@gmail.com',
        password: '123456',
        nif: '5123456789',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.findByPhone.mockResolvedValue(mockUser);

      await expect(service.registerProvider(createProviderDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('deve lançar ConflictException se NIF já existir', async () => {
      const createProviderDto = {
        fullName: 'João Prestador',
        phone: '923987654',
        email: 'new@gamail.com',
        password: '123456',
        nif: '5123456789',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);
      mockUsersRepository.findByNif.mockResolvedValue(mockUser);

      await expect(service.registerProvider(createProviderDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    it('deve realizar login com sucesso', async () => {
      const loginDto = {
        email: 'joao@example.com',
        password: '123456',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      mockJwtService.sign.mockReturnValue('jwt-token');

      const result = await service.login(loginDto);

      expect(result.user).toBeDefined();
      expect(result.access_token).toBe('jwt-token');
    });

    it('deve lançar UnauthorizedException com email inválido', async () => {
      const loginDto = {
        email: 'invalid@example.com',
        password: '123456',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('deve lançar UnauthorizedException com senha inválida', async () => {
      const loginDto = {
        email: 'joao@example.com',
        password: 'wrong-password',
      };

      mockUsersRepository.findByEmail.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('validateBalance', () => {
    it('deve retornar true se o saldo é suficiente', async () => {
      const userId = mockUser.id;
      const amount = 1000;

      mockUsersRepository.findById.mockResolvedValue({
        ...mockUser,
        balance: 4000,
      });

      const result = await service.validateBalance(userId, amount);

      expect(result).toBe(true);
    });

    it('deve retornar false se o saldo é insuficiente', async () => {
      const userId = mockUser.id;
      const amount = 5000;

      mockUsersRepository.findById.mockResolvedValue({
        ...mockUser,
        balance: 1000,
      });

      const result = await service.validateBalance(userId, amount);

      expect(result).toBe(false);
    });

    it('deve retornar false se o usuário não existir', async () => {
      const userId = mockUser.id;
      const amount = 1000;

      mockUsersRepository.findById.mockResolvedValue(null);

      const result = await service.validateBalance(userId, amount);

      expect(result).toBe(false);
    });
  });
});
