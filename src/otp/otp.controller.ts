import { Body, Controller, Post } from '@nestjs/common';
import { OtpService } from './otp.service';

@Controller('otp')
export class OtpController {
  constructor(private readonly otpService: OtpService) {}

  @Post()
  async sendOtp(@Body('email') email: string) {
    const result = await this.otpService.sendOtpToEmail(email);
    return {
      message: 'OTP send successfully',
      otp: result,
    };
  }
}
