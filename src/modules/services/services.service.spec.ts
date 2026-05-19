import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { ServicesService } from './services.service';
import { ServicesRepository } from './services.repository';

describe('ServicesService', () => {
  let service: ServicesService;
  let repository: ServicesRepository;

  const mockServicesRepository = {
    findAll: jest.fn(),
    findById: jest.fn(),
    findByProviderId: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  const mockProviderId = 'provider-123';
  const mockService = {
    id: 'service-456',
    name: 'Serviço de Limpeza',
    description: 'Limpeza residencial',
    price: 5000,
    providerId: mockProviderId,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ServicesService,
        {
          provide: ServicesRepository,
          useValue: mockServicesRepository,
        },
      ],
    }).compile();

    service = module.get<ServicesService>(ServicesService);
    repository = module.get<ServicesRepository>(ServicesRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createService', () => {
    it('deve criar um serviço com sucesso', async () => {
      const createServiceDto = {
        name: 'Serviço de Limpeza',
        description: 'Limpeza residencial',
        price: 5000,
      };

      mockServicesRepository.create.mockResolvedValue(mockService);

      const result = await service.createService(mockProviderId, createServiceDto);

      expect(result).toEqual(mockService);
      expect(mockServicesRepository.create).toHaveBeenCalledWith({
        name: createServiceDto.name,
        description: createServiceDto.description,
        price: createServiceDto.price,
        providerId: mockProviderId,
      });
    });

    it('deve lançar BadRequestException com preço negativo', async () => {
      const createServiceDto = {
        name: 'Serviço',
        description: 'Descrição',
        price: -100,
      };

      await expect(
        service.createService(mockProviderId, createServiceDto),
      ).rejects.toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException com preço zero', async () => {
      const createServiceDto = {
        name: 'Serviço',
        description: 'Descrição',
        price: -1,
      };

      await expect(
        service.createService(mockProviderId, createServiceDto),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getServiceById', () => {
    it('deve retornar um serviço pelo ID', async () => {
      mockServicesRepository.findById.mockResolvedValue(mockService);

      const result = await service.getServiceById(mockService.id);

      expect(result).toEqual(mockService);
      expect(mockServicesRepository.findById).toHaveBeenCalledWith(mockService.id);
    });

    it('deve lançar NotFoundException se serviço não existir', async () => {
      mockServicesRepository.findById.mockResolvedValue(null);

      await expect(service.getServiceById('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllServices', () => {
    it('deve retornar todos os serviços', async () => {
      const mockServices = [mockService, { ...mockService, id: 'service-789' }];
      mockServicesRepository.findAll.mockResolvedValue(mockServices);

      const result = await service.getAllServices();

      expect(result).toEqual(mockServices);
      expect(mockServicesRepository.findAll).toHaveBeenCalled();
    });
  });

  describe('getServicesByProviderId', () => {
    it('deve retornar serviços de um prestador', async () => {
      const providerServices = [mockService];
      mockServicesRepository.findByProviderId.mockResolvedValue(providerServices);

      const result = await service.getServicesByProviderId(mockProviderId);

      expect(result).toEqual(providerServices);
      expect(mockServicesRepository.findByProviderId).toHaveBeenCalledWith(
        mockProviderId,
      );
    });

    it('deve retornar lista vazia se prestador não tem serviços', async () => {
      mockServicesRepository.findByProviderId.mockResolvedValue([]);

      const result = await service.getServicesByProviderId(mockProviderId);

      expect(result).toEqual([]);
    });
  });

  describe('updateService', () => {
    it('deve atualizar um serviço com sucesso', async () => {
      const updateServiceDto = {
        name: 'Novo Nome',
        description: 'Nova Descrição',
        price: 6000,
      };

      const updatedService = { ...mockService, ...updateServiceDto };

      mockServicesRepository.findById.mockResolvedValue(mockService);
      mockServicesRepository.update.mockResolvedValue(updatedService);

      const result = await service.updateService(
        mockService.id,
        mockProviderId,
        updateServiceDto,
      );

      expect(result).toEqual(updatedService);
      expect(mockServicesRepository.update).toHaveBeenCalledWith(mockService.id, {
        name: updateServiceDto.name,
        description: updateServiceDto.description,
        price: updateServiceDto.price,
      });
    });

    it('deve lançar NotFoundException se serviço não existir', async () => {
      const updateServiceDto = {
        name: 'Novo Nome',
        description: 'Nova Descrição',
        price: 6000,
      };

      mockServicesRepository.findById.mockResolvedValue(null);

      await expect(
        service.updateService(
          'invalid-id',
          mockProviderId,
          updateServiceDto,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o prestador não é o dono', async () => {
      const updateServiceDto = {
        name: 'Novo Nome',
        description: 'Nova Descrição',
        price: 6000,
      };

      const otherProviderId = 'other-provider-id';

      mockServicesRepository.findById.mockResolvedValue(mockService);

      await expect(
        service.updateService(
          mockService.id,
          otherProviderId,
          updateServiceDto,
        ),
      ).rejects.toThrow(ForbiddenException);
    });

    it('deve lançar BadRequestException com preço negativo na atualização', async () => {
      const updateServiceDto = {
        name: 'Novo Nome',
        description: 'Nova Descrição',
        price: -1000,
      };

      mockServicesRepository.findById.mockResolvedValue(mockService);

      await expect(
        service.updateService(
          mockService.id,
          mockProviderId,
          updateServiceDto,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('deleteService', () => {
    it('deve deletar um serviço com sucesso', async () => {
      mockServicesRepository.findById.mockResolvedValue(mockService);
      mockServicesRepository.delete.mockResolvedValue(mockService);

      const result = await service.deleteService(mockService.id, mockProviderId);

      expect(result).toEqual(mockService);
      expect(mockServicesRepository.delete).toHaveBeenCalledWith(mockService.id);
    });

    it('deve lançar NotFoundException se serviço não existir', async () => {
      mockServicesRepository.findById.mockResolvedValue(null);

      await expect(
        service.deleteService('invalid-id', mockProviderId),
      ).rejects.toThrow(NotFoundException);
    });

    it('deve lançar ForbiddenException se o prestador não é o dono', async () => {
      const otherProviderId = 'other-provider-id';

      mockServicesRepository.findById.mockResolvedValue(mockService);

      await expect(
        service.deleteService(mockService.id, otherProviderId),
      ).rejects.toThrow(ForbiddenException);
    });
  });
});
