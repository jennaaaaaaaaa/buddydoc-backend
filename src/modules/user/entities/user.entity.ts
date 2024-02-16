import { ApiProperty } from '@nestjs/swagger';
import { users, users_userStatus } from '@prisma/client';

export class UserEntity implements users {
  @ApiProperty()
  userId: number;

  @ApiProperty()
  email: string;

  @ApiProperty()
  userName: string;

  @ApiProperty()
  userNickname: string;

  @ApiProperty()
  userTokken: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  gitURL: string;

  @ApiProperty()
  userStatus: users_userStatus;

  @ApiProperty()
  introduction: string;

  @ApiProperty()
  career: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date | null;

  @ApiProperty()
  deletedAt: Date | null;

  constructor({ ...data }: Partial<UserEntity>) {
    Object.assign(this, data);
  }
}
