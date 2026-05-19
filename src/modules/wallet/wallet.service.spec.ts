import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WalletService } from './wallet.service';
import { WalletRepository } from './wallet.repository';

describe('WalletService', () => {
  let service: WalletService;
  let repository: WalletRepository;

  const mockWalletRepository = {
    getUserBalance: jest.fn(),
    getTransactionHistory: jest.fn(),
    getReceivedTransactions: jest.fn(),
    getSentTransactions: jest.fn(),
  };

  const mockUserId = '123e4567-e89b-12d3-a456-426614174000';
  const mockUserData = {
    id: mockUserId,
    balance: 3000,
    role: 'CLIENT',
    email: 'teste@gmail.com',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WalletService,
        {
          provide: WalletRepository,
          useValue: mockWalletRepository,
        },
      ],
    }).compile();

    service = module.get<WalletService>(WalletService);
    repository = module.get<WalletRepository>(WalletRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getBalance', () => {
    it('deve retornar o saldo do usuário', async () => {
      mockWalletRepository.getUserBalance.mockResolvedValue(mockUserData);

      const result = await service.getBalance(mockUserId);

      expect(result).toEqual({
        balance: 3000,
        userId: mockUserId,
        userRole: 'CLIENT',
      });
      expect(mockWalletRepository.getUserBalance).toHaveBeenCalledWith(mockUserId);
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockWalletRepository.getUserBalance.mockResolvedValue(null);

      await expect(service.getBalance(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('deve retornar saldo correto para PROVIDER', async () => {
      const providerData = { ...mockUserData, role: 'PROVIDER', balance: 5000 };
      mockWalletRepository.getUserBalance.mockResolvedValue(providerData);

      const result = await service.getBalance(mockUserId);

      expect(result.balance).toBe(5000);
      expect(result.userRole).toBe('PROVIDER');
    });
  });

  describe('getTransactionHistory', () => {
    it('deve retornar histórico de transações do usuário', async () => {
      const mockTransactions = [
        {
          id: 'tx-1',
          fromUserId: mockUserId,
          toUserId: 'provider-id',
          amount: 500,
          bookingId: 'booking-1',
          type: 'debit',
          createdAt: new Date(),
        },
      ];

      mockWalletRepository.getUserBalance.mockResolvedValue(mockUserData);
      mockWalletRepository.getTransactionHistory.mockResolvedValue(
        mockTransactions,
      );

      const result = await service.getTransactionHistory(mockUserId);

      expect(result).toEqual(mockTransactions);
      expect(mockWalletRepository.getTransactionHistory).toHaveBeenCalledWith(
        mockUserId,
        50,
      );
    });

    it('deve respeitar o limite de transações', async () => {
      mockWalletRepository.getUserBalance.mockResolvedValue(mockUserData);
      mockWalletRepository.getTransactionHistory.mockResolvedValue([]);

      await service.getTransactionHistory(mockUserId, 100);

      expect(mockWalletRepository.getTransactionHistory).toHaveBeenCalledWith(
        mockUserId,
        100,
      );
    });

    it('deve lançar NotFoundException se o usuário não existir', async () => {
      mockWalletRepository.getUserBalance.mockResolvedValue(null);

      await expect(service.getTransactionHistory(mockUserId)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getReceivedTransactions', () => {
    it('deve retornar apenas transações recebidas (créditos)', async () => {
      const mockReceivedTx = [
        {
          id: 'tx-1',
          fromUserId: 'other-user',
          toUserId: mockUserId,
          amount: 1000,
          type: 'credit',
          createdAt: new Date(),
        },
      ];

      mockWalletRepository.getUserBalance.mockResolvedValue(mockUserData);
      mockWalletRepository.getReceivedTransactions.mockResolvedValue(
        mockReceivedTx,
      );

      const result = await service.getReceivedTransactions(mockUserId);

      expect(result).toEqual(mockReceivedTx);
      expect(result[0].type).toBe('credit');
    });
  });

  describe('getSentTransactions', () => {
    it('deve retornar apenas transações enviadas (débitos)', async () => {
      const mockSentTx = [
        {
          id: 'tx-1',
          fromUserId: mockUserId,
          toUserId: 'other-user',
          amount: 500,
          type: 'debit',
          createdAt: new Date(),
        },
      ];

      mockWalletRepository.getUserBalance.mockResolvedValue(mockUserData);
      mockWalletRepository.getSentTransactions.mockResolvedValue(mockSentTx);

      const result = await service.getSentTransactions(mockUserId);

      expect(result).toEqual(mockSentTx);
      expect(result[0].type).toBe('debit');
    });
  });
});
