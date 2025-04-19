import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { randomInt } from 'crypto';
import * as dotenv from 'dotenv';
import { PrismaService } from 'prisma/prisma.service';

dotenv.config();

@Injectable()
export class OtpService {
  private readonly emailTransporter;

  constructor(private readonly prisma: PrismaService) {
    // Initialize Nodemailer transporter for email
    this.emailTransporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      secure: process.env.EMAIL_PORT === '465', // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  //Email Verification
  async verifyEmail(email: string) {
    const verifyUserEmail = await this.prisma.user.findUnique({
      where: { email },
    });
    return verifyUserEmail;
  }

  // Method to generate OTP
  private generateOtp(): string {
    const otp = randomInt(100000, 999999).toString(); // Generate a 6-digit OTP
    return otp;
  }

  async createOtp(email: string) {
    const userExist = await this.verifyEmail(email);

    if (userExist) {
      const otp = this.generateOtp();
      const userOtp = await this.prisma.otp.create({
        data: {
          userId: userExist.id,
          otp: otp,
        },
      });
      return {
        status: HttpStatus.CREATED,
        message: 'Otp Created Successfully',
        response: userOtp,
      };
    }
  }

  //Send Otp To Email
  async sendOtpToEmail(email: string) {
    try {
      const emailExist = await this.verifyEmail(email);
      if (emailExist) {
        const otp = this.generateOtp();
        try {
          // Send OTP via email
          await this.emailTransporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP is ${otp}`,
            html: `<p>Your OTP is <strong>${otp}</strong></p>`,
          });

          return {
            message: 'OTP send successfully',
            otp: otp, // Return OTP to save it for verification
          };
        } catch (error) {
          console.error('Error sending OTP via email', error);
          throw new Error('Failed to send OTP via email');
        }
      } else {
        const message = 'Email does not exist';
        return { message };
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
}
