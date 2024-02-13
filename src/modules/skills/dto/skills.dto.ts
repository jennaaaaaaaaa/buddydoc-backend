import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';

export class SkillsDto {
  
  
  @ApiProperty()
  @IsInt()
  userId: number; // userId

  @ApiProperty()
  @IsString()
  skill: string; // 기술
}
