import { Controller, Post, Get, Put, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { ServicesService } from './services.service';
import { CreateServiceDto, UpdateServiceDto } from './dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@Controller('services')
@UseGuards(JwtAuthGuard)
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  @HttpCode(HttpStatus.CREATED)
  async createService(
    @Body() createServiceDto: CreateServiceDto,
    @Request() req: any,
  ) {
    return this.servicesService.createService(req.user.id, createServiceDto);
  }

  @Get()
  async getAllServices() {
    return this.servicesService.getAllServices();
  }

  @Get('my-services')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  async getMyServices(@Request() req: any) {
    return this.servicesService.getServicesByProviderId(req.user.id);
  }

  @Get(':id')
  async getServiceById(@Param('id') id: string) {
    return this.servicesService.getServiceById(id);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  @HttpCode(HttpStatus.OK)
  async updateService(
    @Param('id') id: string,
    @Body() updateServiceDto: UpdateServiceDto,
    @Request() req: any,
  ) {
    return this.servicesService.updateService(id, req.user.id, updateServiceDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteService(@Param('id') id: string, @Request() req: any): Promise<void> {
    await this.servicesService.deleteService(id, req.user.id);
  }
}
