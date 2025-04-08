import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'prisma/prisma.module';
import { PrismaService } from 'prisma/prisma.service';

@Module({
  providers: [UsersService, PrismaService],
  controllers: [UsersController],
  imports: [PrismaModule],
  exports: [UsersService],
})
export class UsersModule {}
