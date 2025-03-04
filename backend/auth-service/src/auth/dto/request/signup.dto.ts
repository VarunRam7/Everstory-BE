import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { Transform, Type } from 'class-transformer';

import { ApiProperty } from '@nestjs/swagger';

export class SignupDTO {
  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  firstName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  lastName: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsEmail()
  @Transform(({ value }) => value?.toLowerCase())
  email: string;

  @ApiProperty({ required: true })
  @IsNotEmpty()
  @IsString()
  @Transform(({ value }) => value?.trim())
  password: string;
}
