import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Service } from '@prisma/client';
import { CreateServiceDto } from './dto';
import { UpdateServiceDto } from './dto';

export interface CreateServiceData {
  name: string;
  description: string;
  price: number;
  providerId: string;
}

@Injectable()
export class ServicesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateServiceData): Promise<Service> {
    return this.prisma.service.create({
      data: {
        name: data.name,
        description: data.description,
        price: data.price,
        providerId: data.providerId,
      },
    });
  }

  async findById(id: string): Promise<Service | null> {
    return this.prisma.service.findUnique({
      where: { id },
    });
  }

  async findAll(): Promise<Service[]> {
    return this.prisma.service.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async findByProviderId(providerId: string): Promise<Service[]> {
    return this.prisma.service.findMany({
      where: { providerId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(id: string, data: Partial<CreateServiceData>): Promise<Service> {
    return this.prisma.service.update({
      where: { id },
      data: {
        ...(data.name && { name: data.name }),
        ...(data.description && { description: data.description }),
        ...(data.price !== undefined && { price: data.price }),
      },
    });
  }

  async delete(id: string): Promise<Service> {
    return this.prisma.service.delete({
      where: { id },
    });
  }
}
