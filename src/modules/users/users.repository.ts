import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { User, UserRole } from '@prisma/client';

export interface CreateUserData {
  fullName: string;
  phone: string;
  email: string;
  password: string;
  role: UserRole;
  nif?: string;
}

@Injectable()
export class UsersRepository {
  constructor(private prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { email },
    });
  }

  async findByNif(nif: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { nif },
    });
  }

  async findById(id: string): Promise<User | null> {
    return this.prisma.user.findUnique({
      where: { id },
    });
  }

  async create(data: CreateUserData): Promise<User> {
    const initialBalance = data.role === UserRole.CLIENT ? 4000 : 0;

    return this.prisma.user.create({
      data: {
        fullName: data.fullName,
        phone: data.phone,
        nif: data.nif || null,
        email: data.email,
        password: data.password,
        role: data.role,
        balance: initialBalance,
      },
    });
  }

  async updateBalance(userId: string, newBalance: number): Promise<User> {
    return this.prisma.user.update({
      where: { id: userId },
      data: { balance: newBalance },
    });
  }

  async findAll(): Promise<User[]> {
    return this.prisma.user.findMany();
  }
}
