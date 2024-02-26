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
  UploadedFiles,
  UseFilters,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { posts, users } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { PagingPostsDto } from './dto/paging-post.dto';
import { query, response } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';
import { S3Service } from 'src/providers/aws/s3/s3.service';
import { SearchService } from './search/search.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service,
    private searchService: SearchService
  ) {}

  /**
   * 목록
   * '/posts?orderBy=createdAt&lastPostId=10', '/posts?orderBy=preference&lastPostId=10'
   * @param pagingPostsDto
   * @returns
   */
  @ApiOperation({
    summary: '게시글목록 API',
  })
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
   * 게시글 검색
   * @param search
   * @returns
   */
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  @Get('/search')
  async postSearch(@Query('search') search: string) {
    try {
      console.log('postController =>>>> search:', search);
      const result = await this.searchService.postSearch(search);
      return result;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 상세조회
   * @param postId
   * @returns
   */
  @ApiOperation({
    summary: '게시글 상세조회 API',
  })
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
  @ApiOperation({
    summary: '게시글 참가 유저 프로필 조회 API',
  })
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
   * 게시글생성
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param skillList
   * @param deadLine
   * @param files
   * @returns
   */
  @ApiOperation({
    summary: '게시글 생성 API',
  })
  @Post()
  @UseFilters(HttpExceptionFilter)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'files', maxCount: 1 },
    ])
  )
  @HttpCode(200)
  async createPost(
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string,
    @Body('skillList') skillList: string,
    @Body('deadLine') deadLine: Date,
    @UploadedFiles() files: { image: Express.Multer.File[]; files: Express.Multer.File[] }
  ) {
    try {
      const image = files.image[0];
      const file = files.files[0];
      //사용자 인증에 필요한 userId도 보내줘야함
      //const userId = 1
      await this.postService.createPost(postTitle, content, postType, position, image, file, skillList, deadLine); //userId
      return { message: '게시글이 작성되었습니다' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글수정
   * @param postId
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param skillList
   * @param deadLine
   * @param files
   * @returns
   */
  @ApiOperation({
    summary: '게시글 수정 API',
  })
  @Put(':postId')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'files', maxCount: 1 },
    ])
  )
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async updatePost(
    @Param('postId') postId: number,
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string,
    @Body('skillList') skillList: string,
    @Body('deadLine') deadLine: Date,
    @UploadedFiles() files: { image: Express.Multer.File[]; files: Express.Multer.File[] }
  ) {
    try {
      const image = files.image[0];
      const file = files.files[0];

      //사용자 인증에 필요한 userId 받아서 보내주기
      await this.postService.updatePost(
        postId,
        postTitle,
        content,
        postType,
        position,
        image,
        file,
        skillList,
        deadLine
      );
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
   * @returns
   */
  @ApiOperation({
    summary: '게시글 삭제 API',
  })
  @Delete(':postId')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async deletePost(@Param('postId') postId: number) {
    try {
      //사용자 인증에 필요한 userId 받이서 보내주기
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
  @ApiOperation({
    summary: '북마크 추가/제거 API',
  })
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
