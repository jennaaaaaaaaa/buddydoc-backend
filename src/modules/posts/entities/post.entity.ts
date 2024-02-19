import { posts } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
// @ApiProperty()

export class PostEntity implements posts {
  @ApiProperty()
  postId: number;

  @ApiProperty()
  postTitle: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  position: string;

  @ApiProperty()
  postType: string;

  @ApiProperty()
  imageName: string;

  @ApiProperty()
  fileName: string;

  @ApiProperty()
  preference: number;

  @ApiProperty()
  views: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date | null;

  @ApiProperty()
  deletedAt: Date | null;

  @ApiProperty()
  post_userId: number;

  @ApiProperty()
  deadLine : Date | null;

  @ApiProperty()
  skillList : string;
}