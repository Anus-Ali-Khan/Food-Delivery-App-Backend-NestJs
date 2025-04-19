import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreateOtpDto {
  @IsInt()
  @IsNotEmpty()
  userId: number;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
