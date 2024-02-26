import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
export class MessageDto {
  @ApiProperty()
  @IsInt()
  postId: number;
  // 클라이언트에서 받아와야함

  @ApiProperty()
  @IsInt()
  userId: number;

  //z클라이언트에서 받아와야함
  @ApiProperty()
  @IsString()
  chat_message: string;

  // 클라이언트에서 받아와야함
  // @ApiProperty()
  // @IsString()
  // token: string;

  //   //jwt 사용자 인증 userId => jwt를 통해 서버에서 가져오는 데이터로 dto에 추가x
  //   @ApiProperty()
  //   @IsInt()
  //   userName: string;
}
