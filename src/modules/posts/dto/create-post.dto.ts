//클라이언트에서 받는 값들 유효성 검사

import { ApiProperty } from '@nestjs/swagger';
// @MinLength :최소길이
import { IsDate, IsInt, IsNumber, IsString, isNumber } from 'class-validator';

export class CreatePostsDto {
  //게시글 제목
  @ApiProperty()
  @IsString()
  postTitle: string;

  //게시글 내용
  @ApiProperty()
  @IsString()
  content: string;

  //게시글종류
  @ApiProperty()
  @IsString()
  postType: string;

  //게시글모집분야
  @ApiProperty()
  @IsString()
  position: string;

  @ApiProperty()
  @IsString()
  skillList: string;

  @ApiProperty()
  @IsDate()
  deadLine: Date;

  @ApiProperty()
  @IsDate()
  startDate: Date;

  @ApiProperty()
  @IsInt()
  memberCount: number;

  @ApiProperty()
  @IsString()
  period: string;

  //게시글 작성자
  @ApiProperty()
  @IsInt()
  post_userId: number;
}

//,startDate, numberCount, projectPeriod
