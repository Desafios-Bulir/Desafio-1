import { Module } from '@nestjs/common';
//import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { ServicesModule } from './modules/services/services.module';
import { BookingsModule } from './modules/bookings/bookings.module';


@Module({
  imports: [
    //ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UsersModule,
    ServicesModule,
    BookingsModule,
  ],
})
export class AppModule {}
