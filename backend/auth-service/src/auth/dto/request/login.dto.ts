import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class LoginDTO {
  @IsNotEmpty()
  @IsEmail()
  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  @Transform(({ value }) => value?.trim())
  password: string;
}
