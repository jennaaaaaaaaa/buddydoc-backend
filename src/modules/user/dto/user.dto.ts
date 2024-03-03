import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsInt, IsNumber, IsEnum } from 'class-validator';
import { users_userStatus } from '@prisma/client';

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
  @IsEnum(users_userStatus)
  userStatus: users_userStatus; // 공개상태

  @ApiProperty()
  @IsString()
  introduction: string; // 자기소개

  @ApiProperty()
  @IsString()
  career: string; // 경력

  @ApiProperty()
  @IsString()
  skillList: string[]; // 기술

  @ApiProperty()
  @IsString()
  name: string; // 이름

  @ApiProperty()
  @IsString()
  platform: string; // 플랫폼

  @ApiProperty()
  @IsString()
  profileImage : string; //프로필이미지
}
