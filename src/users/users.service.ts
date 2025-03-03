import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';

import { UpdateUserDto } from './dto/updateUser.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    try {
      const userEmail = await this.findByEmail(createUserDto.email);

      if (userEmail) {
        throw new ConflictException('Email already exists');
      }
      const user = await this.prisma.user.create({
        data: createUserDto,
      });
      return {
        status: HttpStatus.CREATED,
        message: 'User Created Successfully',
        response: user,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
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

  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      const updatedUser = await this.prisma.user.update({
        where: {
          id,
        },
        data: updateUserDto,
      });
      return {
        status: HttpStatus.OK,
        message: 'User Updated Successfully',
        response: updatedUser,
      };
    } catch (error) {
      throw new HttpException(
        {
          status: HttpStatus.INTERNAL_SERVER_ERROR,
          error: 'Internal Server Error',
        },
        HttpStatus.FORBIDDEN,
        {
          cause: error,
        },
      );
    }
  }

  async deleteUser(id: number) {
    const deletedUser = await this.prisma.user.delete({
      where: {
        id,
      },
    });

    return deletedUser;
  }
}
