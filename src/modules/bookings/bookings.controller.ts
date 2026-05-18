import { Controller, Post, Get, Delete, Body, Param, HttpCode, HttpStatus, UseGuards, Request } from '@nestjs/common';
import { Booking } from '@prisma/client';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto';

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

@Controller('bookings')
@UseGuards(JwtAuthGuard)
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Post()
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  @HttpCode(HttpStatus.CREATED)
  async createBooking(
    @Body() createBookingDto: CreateBookingDto,
    @Request() req: any,
  ): Promise<Booking> {
    return this.bookingsService.createBooking(req.user.id, createBookingDto);
  }

  @Get('my-bookings')
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  async getMyBookings(@Request() req: any): Promise<Booking[]> {
    return this.bookingsService.getMyBookings(req.user.id);
  }

  @Get('provider/bookings')
  @UseGuards(RolesGuard)
  @Roles('PROVIDER')
  async getProviderBookings(@Request() req: any): Promise<Booking[]> {
    return this.bookingsService.getProviderBookings(req.user.id);
  }

  @Get(':id')
  async getBookingById(@Param('id') id: string, @Request() req: any): Promise<Booking> {
    return this.bookingsService.getBookingById(id, req.user.id);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('CLIENT')
  @HttpCode(HttpStatus.OK)
  async cancelBooking(@Param('id') id: string, @Request() req: any): Promise<Booking> {
    return this.bookingsService.cancelBooking(id, req.user.id);
  }
}
