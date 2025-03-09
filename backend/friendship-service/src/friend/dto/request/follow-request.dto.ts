import { IsNotEmpty, IsString } from 'class-validator';

import { ApiProperty } from '@nestjs/swagger';

export class FollowRequestDTO {
  @IsNotEmpty()
  @IsString()
  @ApiProperty({ required: true })
  requestTo: string;
}
