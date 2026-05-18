import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Transaction } from '@prisma/client';

@Injectable()
export class WalletRepository {
  constructor(private prisma: PrismaService) {}

  async getUserBalance(userId: string): Promise<any | null> {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        balance: true,
        role: true,
        email: true,
      },
    });
  }

  async getTransactionHistory(userId: string, limit: number = 50): Promise<any[]> {
    // Buscar transações onde o usuário é remetente (débito)
    const sentTransactions = await this.prisma.transaction.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Buscar transações onde o usuário é destinatário (crédito)
    const receivedTransactions = await this.prisma.transaction.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    // Mapear transações com tipo (debit ou credit)
    const mappedSent = sentTransactions.map((tx) => ({
      id: tx.id,
      fromUserId: tx.fromUserId,
      fromUserEmail: null,
      toUserId: tx.toUserId,
      toUserEmail: tx.toUser.email,
      amount: tx.amount,
      bookingId: tx.bookingId,
      createdAt: tx.createdAt,
      type: 'debit' as const,
    }));

    const mappedReceived = receivedTransactions.map((tx) => ({
      id: tx.id,
      fromUserId: tx.fromUserId,
      fromUserEmail: tx.fromUser.email,
      toUserId: tx.toUserId,
      toUserEmail: null,
      amount: tx.amount,
      bookingId: tx.bookingId,
      createdAt: tx.createdAt,
      type: 'credit' as const,
    }));

    // Combinar e ordenar por data
    const allTransactions = [...mappedSent, ...mappedReceived]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit);

    return allTransactions;
  }

  async getReceivedTransactions(userId: string, limit: number = 50): Promise<any[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { toUserId: userId },
      include: {
        fromUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((tx) => ({
      id: tx.id,
      fromUserId: tx.fromUserId,
      fromUserEmail: tx.fromUser.email,
      toUserId: tx.toUserId,
      toUserEmail: null,
      amount: tx.amount,
      bookingId: tx.bookingId,
      createdAt: tx.createdAt,
      type: 'credit',
    }));
  }

  async getSentTransactions(userId: string, limit: number = 50): Promise<any[]> {
    const transactions = await this.prisma.transaction.findMany({
      where: { fromUserId: userId },
      include: {
        toUser: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    return transactions.map((tx) => ({
      id: tx.id,
      fromUserId: tx.fromUserId,
      fromUserEmail: null,
      toUserId: tx.toUserId,
      toUserEmail: tx.toUser.email,
      amount: tx.amount,
      bookingId: tx.bookingId,
      createdAt: tx.createdAt,
      type: 'debit',
    }));
  }
}
