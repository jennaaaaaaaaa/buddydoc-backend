import { ApiProperty, ApiResponseProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator'
export class InfoDto {
  
  @ApiProperty()
  @IsInt()
  userId : number // userId

  @ApiProperty()
  @IsString()
  name : string // 조회 타입

}
