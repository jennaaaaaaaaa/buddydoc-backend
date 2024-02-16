//클라이언트에서 받는 값들 유효성 검사

import { ApiProperty } from '@nestjs/swagger';
// @MinLength :최소길이
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreatePostsDto {
  //게시글 제목
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postTitle: string;

  //게시글 내용
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  content: string;

  //게시글종류
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postType: string;

  //게시글업로드이미지
  @ApiProperty()
  @IsString()
  imageName?: string;

  //게시글업로드파일
  @ApiProperty()
  @IsString()
  fileName?: string;

  //게시글모집분야
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  position: string;

  // @ApiProperty()
  // @IsNumber()
  // post_userId: number;
}
