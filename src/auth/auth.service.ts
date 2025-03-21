import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AuthEntity } from './entity/auth.entity';
import { LoginDto } from './dto/login.dto';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthEntity> {
    // Step 1 : Fetch a user with the given email
    const user = await this.prisma.user.findUnique({
      where: {
        email: loginDto.email,
      },
    });
    //If no user is found, throw an error
    if (!user) {
      throw new NotFoundException(
        `No user found for email : ${loginDto.email}`,
      );
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
