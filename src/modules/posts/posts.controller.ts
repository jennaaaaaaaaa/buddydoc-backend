import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { posts, users } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { PagingPostsDto } from './dto/paging-post.dto';
import { response } from 'express';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';
import { S3Service } from 'src/providers/aws/s3/s3.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service
  ) {}

  /**
   * 목록
   * '/posts?orderBy=createdAt&lastPostId=10', '/posts?orderBy=preference&lastPostId=10'
   * @param pagingPostsDto
   * @returns
   */
  @Get()
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async getAllPosts(@Query() pagingPostsDto: PagingPostsDto) {
    try {
      let orderField: 'createdAt' | 'preference' = 'createdAt'; //기본값 최신순
      if (pagingPostsDto.orderBy === 'preference') {
        orderField = 'preference';
      }
      const lastPostId = Number(pagingPostsDto.lastPostId);
      const posts = await this.postService.getAllPosts(orderField, lastPostId);
      return posts;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 상세조회
   * @param postId
   * @returns
   */
  @Get(':postId')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async getOnePost(@Param('postId') postId: number) {
    try {
      const post = await this.postService.getOnePost(postId);
      return post;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 참가 유저 프로필 조회
   * @param userId
   * @returns
   */
  @Get(':postId/participants')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async getParticipantsInPost(@Param('postId') postId: number) {
    try {
      const users = await this.postService.getParticipantsInPost(postId);
      return users;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 생성
   * post_userId는 나중에 로그인한 userId 넣어주기
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param fileName
   * @param file
   * @param skill
   * @param deadLine
   * @returns
   */
  @Post()
  @UseFilters(HttpExceptionFilter)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('imageName'))
  @HttpCode(200)
  async createPost(
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string,
    @Body('fileName') fileName: string,
    @Body('skillList') skillList: string,
    @Body('deadLine') deadLine: Date,
    @UploadedFile() file: Express.Multer.File
  ) {
    try {
      await this.postService.createPost(postTitle, content, postType, position, fileName, file, skillList, deadLine);
      return { message: '게시글이 작성되었습니다' };
    } catch (error) {
      // console.error('error', error);
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 수정
   * @param postId
   * @param updatePostsDto
   * @returns
   */
  @Put(':postId')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async updatePost(@Param('postId') postId: number, @Body() updatePostsDto: UpdatePostsDto) {
    try {
      await this.postService.updatePost(postId, updatePostsDto);
      return { message: '수정되었습니다' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 삭제
   * 본인인증
   *
   * @param postId
   * @param updatePostsDto
   * @returns
   */
  @Delete(':postId')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async deletePost(@Param('postId') postId: number) {
    try {
      await this.postService.deletePost(postId);
      return { message: '삭제되었습니다' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 북마크 추가/제거
   * @param postId
   * @returns
   */
  // @UseGuards(AuthGuard())
  @Post(':postId/bookmarks')
  async toggleBookmark(@Param('postId') postId: number) {
    //@Request() req
    // 로그인된 사용자의 ID를 가져옵니다.
    // const userId = req.user.userId;
    const userId = 2;

    try {
      const result = await this.postService.toggleBookmark(userId, postId);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
