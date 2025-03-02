import { ConflictException, Injectable } from '@nestjs/common';
import { sign } from 'crypto';
import { SignupDto } from 'src/auth/dto/signup.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import { ExceptionsHandler } from '@nestjs/core/exceptions/exceptions-handler';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    const userEmail = await this.findByEmail(createUserDto.email);

    if (userEmail) {
      throw new ConflictException('Email already exists');
    }
    const user = await this.prisma.user.create({
      data: createUserDto,
    });
    return user;
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });
    return user;
  }
}
