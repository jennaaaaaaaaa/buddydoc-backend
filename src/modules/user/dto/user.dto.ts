import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber } from 'class-validator';
export class UserDto {
  @ApiProperty()
  @IsNumber()
  userId: number;

  @ApiProperty()
  @IsString()
  email: string; // 이메일

  @ApiProperty()
  @IsString()
  userName: string; // 이름

  @ApiProperty()
  @IsString()
  userNickname: string; // 유저 닉네임

  @ApiProperty()
  @IsString()
  password: string; // 토큰

  @ApiProperty()
  @IsString()
  position: string; // 직무

  @ApiProperty()
  @IsString()
  gitURL: string; // 깃주소

  @ApiProperty()
  @IsString()
  userStatus: string; // 공개상태

  @ApiProperty()
  @IsString()
  introduction: string; // 자기소개

  @ApiProperty()
  @IsInt()
  career: number; // 경력

  @ApiProperty()
  @IsString()
  skills: string[]; // 기술

  @IsString()
  name: string;

  @IsString()
  platform: string; // 플랫폼
}
