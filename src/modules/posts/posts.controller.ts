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
import { response } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
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
  @ApiOperation({
    summary: '게시글목록 API',
  })
  @Get()
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async getAllPosts(@Query() pagingPostsDto: PagingPostsDto) {
    try {
      //const userId = 2; //임시값
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
  @ApiOperation({
    summary: '게시글 상세조회 API',
  })
  @Get(':postId')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async getOnePost(@Param('postId') postId: number) {
    try {
      //const userinfo = req.user.userId
      const userId = 2;
      const post = await this.postService.getOnePost(postId, userId);
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
   *
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param skillList
   * @param deadLine
   * @returns
   */
  @ApiOperation({ summary: '게시글 생성 API' })
  @Post()
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async createPost(
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string,
    @Body('skillList') skillList: string,
    @Body('deadLine') deadLine: Date
    //IF 테이블이 따로 없다면, 있다면 따로 있든 없든 클라이언트에서 요청 하나씩 받아야함
    //시작일 컬럼, 모집인원컬럼, 진행기간 컬럼
    //@Body('startDate') startDate: Date,
    //@Body('numberCount') numberCount: number,
    //@Body('projectPeriod') projectPeriod: string,
  ) {
    try {
      await this.postService.createPost(postTitle, content, postType, position, skillList, deadLine); //,startDate, numberCount, projectPeriod
      return { message: '게시글이 작성되었습니다' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   *
   * @param postId
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param skillList
   * @param deadLine
   * @returns
   */
  @ApiOperation({
    summary: '게시글 수정 API',
  })
  @Put(':postId')
  @UseFilters(HttpExceptionFilter)
  @HttpCode(200)
  async updatePost(
    @Param('postId') postId: number,
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string,
    @Body('skillList') skillList: string,
    @Body('deadLine') deadLine: Date
    //IF 테이블이 따로 없다면, 있다면 따로 있든 없든 클라이언트에서 요청 하나씩 받아야함
    //시작일 컬럼, 모집인원컬럼, 진행기간 컬럼
    //@Body('startDate') startDate: Date,
    //@Body('numberCount') numberCount: number,
    //@Body('projectPeriod') projectPeriod: string,
  ) {
    try {
      await this.postService.updatePost(postId, postTitle, content, postType, position, skillList, deadLine); //,startDate, numberCount, projectPeriod
      return { message: '수정되었습니다' };
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // /**
  //  *
  //  * @param createPostsDto
  //  * @returns
  //  */
  // @ApiOperation({
  //   summary: '게시글 생성 API',
  // })
  // @Post()
  // @UseFilters(HttpExceptionFilter)
  // @HttpCode(200)
  // async createPost(@Body() createPostsDto: CreatePostsDto) {
  //   try {
  //     const userId =1
  //     await this.postService.createPost(createPostsDto, userId);
  //     return { message: '게시글이 작성되었습니다' };
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // @ApiOperation({
  //   summary: '게시글 수정 API',
  // })
  // @Put(':postId')
  // @UseFilters(HttpExceptionFilter)
  // @HttpCode(200)
  // async updatePost(@Param('postId') postId: number, @Body() updatePostsDto: CreatePostsDto) {
  //   try {
  //     await this.postService.updatePost(postId, updatePostsDto);
  //     return { message: '수정되었습니다' };
  //   } catch (error) {
  //     throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
  //   }
  // }

  // 토스트 UI 에디터에서 이미지와 파일 업로드를 위해 별도의 API를 호출
  //따로 데이터베이스와 상호작용이 필요하지 않거나 비지니스 로직이 필요하지 않은 경우 서비스파일에 구현할 필요x
  /**
   *
   * @param image
   * @returns
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('image'))
  async uploadImage(@UploadedFile() image: Express.Multer.File) {
    const imageName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const imageExt = image.originalname.split('.').pop();
    const imageUrl = await this.s3Service.imageUploadToS3(`${imageName}.${imageExt}`, image, imageExt);

    return { imageUrl };
  }

  /**
   *
   * @param file
   * @returns
   */
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const fileExt = file.originalname.split('.').pop();
    const fileUrl = await this.s3Service.fileUploadToS3(`${fileName}.${fileExt}`, file, fileExt);

    return { fileUrl };
  }

  /**
   * 게시글 삭제
   * 본인인증
   *
   * @param postId
   * @param updatePostsDto
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
