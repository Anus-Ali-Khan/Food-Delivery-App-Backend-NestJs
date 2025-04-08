import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from 'prisma/prisma.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from 'src/users/users.module';
import { PrismaService } from 'prisma/prisma.service';

// export const jwtSecret = 'zjP9h6ZI5LoSKCRj';

@Module({
  imports: [
    PrismaModule,
    PassportModule,
    JwtModule.register({
      secret: 'zjP9h6ZI5LoSKCRj',
      signOptions: { expiresIn: '24h' }, // e.g. 30s, 7d, 24h
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, PrismaService],
})
export class AuthModule {}
