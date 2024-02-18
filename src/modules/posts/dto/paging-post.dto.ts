import { IsIn, IsOptional, IsInt } from 'class-validator';

export class PagingPostsDto {
  @IsIn(['createdAt', 'preference'])
  @IsOptional()
  orderBy?: string;

  @IsOptional()
  lastPostId?: string;
}
