import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
export class MessageDto {
  @ApiProperty()
  @IsInt()
  postId: number;

  // @ApiProperty()
  // @IsInt()
  // userId: number;

  @ApiProperty()
  @IsString()
  chat_message: string;
}
