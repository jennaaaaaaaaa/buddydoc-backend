import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { notifications_notiStatus } from '@prisma/client';
import { IsString, IsInt, IsNumber, IsEnum } from 'class-validator';

export class NotiDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsNumber()
  postId: number;

  @ApiProperty()
  @IsNumber()
  noti_userId: number;

  @ApiProperty()
  @IsString()
  noti_message: String;

  @ApiProperty()
  @IsEnum(notifications_notiStatus)
  notiStatus: notifications_notiStatus;
}
