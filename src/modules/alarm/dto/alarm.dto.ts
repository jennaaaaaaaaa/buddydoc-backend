import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsInt } from 'class-validator';
export class AlarmDto {
  @ApiProperty()
  @IsInt()
  userId: number; // 알림을 받는 사람

  @ApiProperty()
  @IsInt()
  noteId: number; // 보낸 쪽지의 id

  @ApiProperty()
  @IsInt()
  notes_userId: number; // 쪽지 보낸 사람

  @ApiProperty()
  @IsInt()
  postId: number; // 게시글 번호

  @ApiProperty()
  @IsInt()
  noti_userid: number; // 게시글 신청자

  @ApiProperty()
  @IsString()
  alarmStatus: String; // 읽음 안읽음 상태

  @ApiProperty()
  @IsString()
  alarmMessage: String; // 메세지 내용
}
