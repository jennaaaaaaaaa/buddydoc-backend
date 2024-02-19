import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
export class MessageDto {
  // @ApiProperty()
  // @IsInt()
  // postId: number;
  //클라이언트에서 받아와야함

  //z클라이언트에서 받아와야함
  @ApiProperty()
  @IsString()
  chat_message: string;

  //   //jwt 사용자 인증 userId => jwt를 통해 서버에서 가져오는 데이터로 dto에 추가x
  //   @ApiProperty()
  //   @IsInt()
  //   userName: string;

  //@IsOptional() 클라이언트로 부터 받지않아도 됨
  //   @IsOptional()
  //   createdAt: Date;
  //이거는 소켓에서 클라이언트로 보내지 않아도 됨 메세지를 불러오는 로직에서 createdAt값을 불러와야함
}
