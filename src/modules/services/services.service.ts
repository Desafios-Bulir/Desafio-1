import { Injectable, BadRequestException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { ServicesRepository } from './services.repository';
import { CreateServiceDto, UpdateServiceDto } from './dto';

@Injectable()
export class ServicesService {
  constructor(private servicesRepository: ServicesRepository) {}

  async createService(providerId: string, createServiceDto: CreateServiceDto) {
    if (createServiceDto.price < 0) {
      throw new BadRequestException('Preço não pode ser negativo');
    }

    return this.servicesRepository.create({
      name: createServiceDto.name,
      description: createServiceDto.description,
      price: createServiceDto.price,
      providerId,
    });
  }

  async getAllServices() {
    return this.servicesRepository.findAll();
  }

  async getServiceById(id: string) {
    const service = await this.servicesRepository.findById(id);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }
    return service;
  }

  async getServicesByProviderId(providerId: string) {
    return this.servicesRepository.findByProviderId(providerId);
  }

  async updateService(
    serviceId: string,
    providerId: string,
    updateServiceDto: UpdateServiceDto,
  ) {
    const service = await this.servicesRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (service.providerId !== providerId) {
      throw new ForbiddenException('Você não tem permissão para atualizar este serviço');
    }

    if (updateServiceDto.price !== undefined && updateServiceDto.price < 0) {
      throw new BadRequestException('Preço não pode ser negativo');
    }

    return this.servicesRepository.update(serviceId, {
      name: updateServiceDto.name,
      description: updateServiceDto.description,
      price: updateServiceDto.price,
    });
  }

  async deleteService(serviceId: string, providerId: string) {
    const service = await this.servicesRepository.findById(serviceId);
    if (!service) {
      throw new NotFoundException('Serviço não encontrado');
    }

    if (service.providerId !== providerId) {
      throw new ForbiddenException('Você não tem permissão para deletar este serviço');
    }

    return this.servicesRepository.delete(serviceId);
  }
}
