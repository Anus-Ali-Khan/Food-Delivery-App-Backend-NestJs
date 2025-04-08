import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';

import { PrismaService } from 'prisma/prisma.service';
import { CreateUserDto } from './dto/createUser.dto';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/updateUser.dto';

export const roundsOfHashing = 10;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  //Create user
  async create(createUserDto: CreateUserDto) {
    try {
      const userEmail = await this.findByEmail(createUserDto.email);

      if (userEmail) {
        throw new ConflictException('Email already exists');
      }

      const hashedPassword = await bcrypt.hash(
        createUserDto.password,
        roundsOfHashing,
      );

      createUserDto.password = hashedPassword;

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

  //Find by email
  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  async findOne(id: number) {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id,
        },
      });
      if (user) {
        return {
          status: HttpStatus.FOUND,
          message: 'User found Successfully',
          response: user,
        };
      } else {
        return {
          status: HttpStatus.NOT_FOUND,
          message: 'User not found',
          response: user,
        };
      }
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

  async findAll() {
    try {
      const users = await this.prisma.user.findMany({});
      return {
        status: HttpStatus.OK,
        message: 'All users',
        response: users,
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

  //Update User
  async updateUser(id: number, updateUserDto: UpdateUserDto) {
    try {
      if (updateUserDto.password) {
        updateUserDto.password = await bcrypt.hash(
          updateUserDto.password,
          roundsOfHashing,
        );
      }

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

  //Delete User
  async deleteUser(id: number) {
    try {
      const deletedUser = await this.prisma.user.delete({
        where: {
          id,
        },
      });

      return {
        status: HttpStatus.OK,
        message: 'User Deleted Successfully',
        response: deletedUser,
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
}
