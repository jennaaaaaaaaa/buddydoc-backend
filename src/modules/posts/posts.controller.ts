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
  Req,
  Res,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from './posts.service';
import { posts, users } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { PagingPostsDto } from './dto/paging-post.dto';
import { Response, Request, response } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';
import { S3Service } from 'src/providers/aws/s3/s3.service';
import { JwtAuthGuard, OptionalJwtAuthGuard } from 'src/auth/oauth/auth.guard';

//elastic 사용시 주석해제
import { SearchService } from './search/search.service';

@Controller('post')
export class PostController {
  constructor(
    private readonly postService: PostService,
    private readonly s3Service: S3Service,
    //elastic 사용시 주석해제
    private searchService: SearchService
  ) {}

  /**
   * 목록
   * '/posts?orderBy=createdAt&lastPostId=10', '/posts?orderBy=preference&lastPostId=10'
   * @param pagingPostsDto
   * @returns
   */

  @ApiTags('posts')
  @ApiOperation({ summary: '게시글목록 API' })
  @ApiQuery({ name: 'orderBy', required: false })
  @ApiQuery({ name: 'lastPostId', required: false })
  @ApiQuery({ name: 'postType', required: false })
  @ApiQuery({ name: 'isEnd', required: false })
  @ApiResponse({ status: 200, description: '게시글 목록 조회 성공' })
  @UseGuards(OptionalJwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  @Get()
  async getAllPosts(@Req() req: Request, @Res() res: Response, @Query() pagingPostsDto: PagingPostsDto) {
    try {
      // const userId = 27; //임시값
      const userId = req.user ? req.user['id'] : null;
      let orderField: 'createdAt' | 'preference' = 'createdAt'; //기본값 최신순
      if (pagingPostsDto.orderBy === 'preference') {
        orderField = 'preference';
      }
      const lastPostId = Number(pagingPostsDto.lastPostId);
      const postType = pagingPostsDto.postType;
      const isEnd = pagingPostsDto.isEnd;
      const posts = await this.postService.getAllPosts(orderField, userId, isEnd, postType, lastPostId);
      return res.status(200).json({ posts });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // elasticsearch 사용시 주석해제 or 주석처리
  /**
   * 게시글 검색
   * @param search
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({ summary: '게시글 검색' })
  @ApiQuery({ name: 'search', required: true })
  @ApiQuery({ name: 'pageCursor', required: false })
  @ApiResponse({ status: 200, description: '게시글 검색 성공' })
  @UseFilters(HttpExceptionFilter)
  @Get('/search')
  async postSearch(@Res() res: Response, @Query('search') search: string, @Query('pageCursor') pageCursor?: string) {
    try {
      // const cursor = pageCursor ? parseInt(pageCursor) : undefined;
      // console.log('검색한 키워드 postController =>>>> search:', search);
      // console.log('검색한 키워드 postController =>>>> pageCursor:', pageCursor);
      const result = await this.searchService.postSearch(search, pageCursor);
      return res.status(200).json({ message: '게시글 검색에 성공하였습니다', result });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 상세조회
   * @param postId
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({
    summary: '게시글 상세조회 API',
  })
  @ApiParam({ name: 'postId', description: '조회할 게시글의 ID' })
  @ApiResponse({ status: 200, description: '게시글 조회에 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @Get(':postId')
  @UseGuards(OptionalJwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  async getOnePost(@Param('postId') postId: number, @Res() res: Response, @Req() req: Request) {
    try {
      const userId = req.user ? req.user['id'] : null;
      // const userId = 27;
      const post = await this.postService.getOnePost(postId, userId);
      if (!post) {
        return res.status(404).json({ message: '게시글이 존재하지 않습니다' });
      }
      return res.status(200).json({ post });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 게시글 참가 유저 프로필 조회
   * @param postId
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({
    summary: '게시글 참가 유저들 프로필 조회 API',
  })
  @ApiParam({ name: 'postId', description: '조회할 게시글의 ID' })
  @ApiResponse({ status: 200, description: '게시글에 참가한 유저 프로필이 조회되었습니다.' })
  @Get(':postId/participants')
  // @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  async getParticipantsInPost(@Param('postId') postId: number, @Res() res: Response) {
    try {
      // const userId = req.user['id']
      // const userId = 2
      // const users = await this.postService.getParticipantsInPost(postId, userId);
      const user = await this.postService.getParticipantsInPost(postId);
      return res.status(200).json({ message: '게시글에 참가한 유저 프로필이 조회되었습니다', user });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  // @UseGuards(JwtAuthGuard)
  // const userId = req.user['id']

  /**
   * 게시글 생성
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param skillList
   * @param deadLine
   * @param startDate
   * @param memberCount
   * @param period
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({ summary: '게시글 생성 API' })
  // @ApiBody({type: CreatePostsDto})
  @ApiResponse({ status: 200, description: '게시글 생성에 성공하였습니다.' })
  @ApiResponse({ status: 400, description: '잘못된 요청입니다.' })
  @Post()
  @UseGuards(JwtAuthGuard)
  @UseFilters(HttpExceptionFilter)
  async createPost(
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string[],
    @Body('skillList') skillList: string[],
    @Body('deadLine') deadLine: Date,
    @Body('startDate') startDate: Date,
    @Body('memberCount') memberCount: number,
    @Body('period') period: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const userId = req.user['id'];
      // const userId = 23;
      await this.postService.createPost(
        postTitle,
        content,
        postType,
        position,
        skillList,
        deadLine,
        startDate,
        memberCount,
        period,
        userId
      );
      return res.status(200).json({ message: '게시글이 작성되었습니다' });
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
   * @param startDate
   * @param memberCount
   * @param period
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({
    summary: '게시글 수정 API',
  })
  @ApiParam({ name: 'postId', description: '수정할 게시글의 ID' })
  @Put(':postId')
  @UseFilters(HttpExceptionFilter)
  @UseGuards(JwtAuthGuard)
  async updatePost(
    @Param('postId') postId: number,
    @Body('postTitle') postTitle: string,
    @Body('content') content: string,
    @Body('postType') postType: string,
    @Body('position') position: string[],
    @Body('skillList') skillList: string[],
    @Body('deadLine') deadLine: Date,
    @Body('startDate') startDate: Date,
    @Body('memberCount') memberCount: number,
    @Body('period') period: string,
    @Res() res: Response,
    @Req() req: Request
  ) {
    try {
      const userId = req.user['id'];
      // const userId = 23;
      await this.postService.updatePost(
        postId,
        postTitle,
        content,
        postType,
        position,
        skillList,
        deadLine,
        startDate,
        memberCount,
        period,
        userId
      );
      return res.status(200).json({ message: '수정되었습니다' });
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
  @ApiTags('posts')
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
  @ApiTags('posts')
  @Post('upload-file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    const fileName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const fileExt = file.originalname.split('.').pop();
    const fileUrl = await this.s3Service.fileUploadToS3(`${fileName}.${fileExt}`, file, fileExt);

    return { fileUrl };
  }

  /**
   *
   * 게시글 삭제
   * 본인인증
   * @param postId
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({
    summary: '게시글 삭제 API',
  })
  @ApiParam({ name: 'postId', description: '삭제할 게시글의 ID' })
  @UseGuards(JwtAuthGuard)
  @Delete(':postId')
  @UseFilters(HttpExceptionFilter)
  async deletePost(@Param('postId') postId: number, @Res() res: Response, @Req() req: Request) {
    try {
      const userId = req.user['id'];
      // const userId = 23;
      await this.postService.deletePost(postId, userId);
      return res.status(200).json({ message: '삭제되었습니다' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  /**
   * 북마크 추가/제거
   * @param postId
   * @returns
   */
  @ApiTags('posts')
  @ApiOperation({
    summary: '게시글 북마크 API',
  })
  @ApiParam({ name: 'postId', description: '북마크할 게시글의 ID' })
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '북마크 추가/제거 API',
  })
  @Post(':postId/bookmarks')
  async toggleBookmark(@Param('postId') postId: string, @Res() res: Response, @Req() req: Request) {
    try {
      const userId = req.user['id'];
      // const userId = 27;
      // const result = await this.postService.toggleBookmark(userId, postId);
      await this.postService.toggleBookmark(userId, postId);
      return res.status(200).json({ message: '북마크가 성공적으로 처리되었습니다' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
