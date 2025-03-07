import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class FollowRequestDTO {
  @IsNotEmpty()
  @ApiProperty({ required: true })
  @IsString()
  requestBy: string;

  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  requestTo: string;
}
