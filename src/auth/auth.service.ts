import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';
import { roundsOfHashing, UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private userService: UsersService,
  ) {}

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });
    return user;
  }

  async signup(signupDto: SignupDto) {
    try {
      const userEmail = await this.findByEmail(signupDto.email);
      const userRoleExist = await this.prisma.role.findFirst({
        where: {
          userId: userEmail?.id,
        },
      });

      // If email and role both exist
      if (userEmail && userRoleExist) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Email and Role already exist',
        };
      }

      const hashedPassword = await bcrypt.hash(
        signupDto.password,
        roundsOfHashing,
      );

      signupDto.password = hashedPassword;

      // If Email Exist and Role does not exist
      if (userEmail && !userRoleExist) {
        const addNewRole = await this.prisma.role.create({
          data: {
            userId: userEmail.id,
            role: signupDto.role,
          },
        });

        return {
          status: HttpStatus.CREATED,
          message: `New role assign to the user ${userEmail.email}`,
          response: { userEmail, role: addNewRole },
          accessToken: this.jwtService.sign(
            { userId: userEmail.id },
            {
              secret: 'zjP9h6ZI5LoSKCRj',
              expiresIn: '24h',
            },
          ),
        };
      }

      // If neither Email nor role exist
      const { role, ...body } = signupDto;

      const user = await this.prisma.user.create({
        data: body,
      });

      const userRole = await this.prisma.role.create({
        data: {
          userId: user.id,
          role: signupDto.role,
        },
      });

      return {
        status: HttpStatus.CREATED,
        message: 'User Created Successfully',
        response: { user, role: userRole },
        accessToken: this.jwtService.sign(
          { userId: user.id },
          {
            secret: 'zjP9h6ZI5LoSKCRj',
            expiresIn: '24h',
          },
        ),
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

  async login(loginDto: LoginDto): Promise<AuthEntity> {
    // Step 1 : Fetch a user with the given email
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });

    const userRole = await this.prisma.role.findMany({
      where: {
        id: user?.id,
      },
    });

    //If no user and role is found, throw an error
    if (!user && !userRole) {
      throw new NotFoundException(
        `No user found for email and role : ${loginDto.email} and ${loginDto.role}`,
      );
    }

    //If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(
        `No user found for email : ${loginDto.email} `,
      );
    }

    //If no role is found, throw an error
    if (!userRole) {
      throw new NotFoundException(`No user found for role :  ${loginDto.role}`);
    }

    // Step 2: Check If the password is correct
    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );
    // If password does not match, throw an error
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid Passowrd');
    }
    //Step 3 : Generate a JWT containing the user's ID and return it
    return {
      accessToken: this.jwtService.sign(
        { userId: user.id },
        {
          secret: 'zjP9h6ZI5LoSKCRj',
          expiresIn: '24h',
        },
      ),
    };
  }
}
