import { Injectable, NotFoundException } from '@nestjs/common';
import { WalletRepository } from './wallet.repository';
import { WalletResponseDto, TransactionResponseDto } from './dto';

@Injectable()
export class WalletService {
  constructor(private walletRepository: WalletRepository) {}

  async getBalance(userId: string): Promise<WalletResponseDto> {
    const user = await this.walletRepository.getUserBalance(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return {
      balance: user.balance,
      userId: user.id,
      userRole: user.role,
    };
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<TransactionResponseDto[]> {
    const user = await this.walletRepository.getUserBalance(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.walletRepository.getTransactionHistory(userId, limit);
  }

  async getReceivedTransactions(userId: string, limit: number = 50): Promise<TransactionResponseDto[]> {
    const user = await this.walletRepository.getUserBalance(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.walletRepository.getReceivedTransactions(userId, limit);
  }

  async getSentTransactions(userId: string, limit: number = 50): Promise<TransactionResponseDto[]> {
    const user = await this.walletRepository.getUserBalance(userId);
    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.walletRepository.getSentTransactions(userId, limit);
  }
}
