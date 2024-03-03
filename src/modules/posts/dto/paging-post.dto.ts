import { IsIn, IsOptional, IsInt, IsString, isNumber, isInt } from 'class-validator';

export class PagingPostsDto {
  @IsIn(['createdAt', 'preference'])
  @IsOptional()
  orderBy?: 'createdAt' | 'preference';

  @IsOptional()
  lastPostId?: string;

  @IsOptional()
  @IsString()
  postType?: '스터디' | '프로젝트';

  @IsOptional()
  @IsInt()
  isEnd?: 0 | 1;
}
