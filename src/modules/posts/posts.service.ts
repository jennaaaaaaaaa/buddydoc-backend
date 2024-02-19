import { Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { posts, Prisma } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { S3Service } from 'src/providers/aws/s3/s3.service';

// import { PostsEntity } from './entities/post.entity';
// import { SearchService } from '../search/search.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
    // esService: SearchService
  ) {}

  /**
   * 목록조회 (+ 페이징, 최신순, 인기순<북마크많은순서>)
   * 로그인 안되있어도 됨
   *
   * @returns
   */
  async getAllPosts(orderField: 'createdAt' | 'preference', lastPostId?: number) {
    //whereCondition은 Prisma.PostsWhereInput 타입의 변수로서, 초기 조건으로 deletedAt이 null인 데이터를 대상으로 설정
    let whereCondition: Prisma.postsWhereInput = { deletedAt: null };

    if (lastPostId) {
      whereCondition = {
        ...whereCondition,
        postId: {
          lt: lastPostId,
        },
      };
    }

    const posts = await this.prisma.posts.findMany({
      where: whereCondition,
      orderBy: { [orderField]: 'desc' },
      take: 10, //10개씩,  prisma에서 제공하는 옵션 기능
      select: {
        postId: true,
        postTitle: true,
        position: true,
        postType: true,
        preference: true,
        views: true,
        createdAt: true,
        updatedAt: true,
        post_userId: true,
        users: {
          select: {
            userNickname: true,
          },
        },
      },
    });

    return posts.map((post) => ({
      ...post,
      createdAt: new Date(post.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false }),
      updatedAt: post.updatedAt
        ? new Date(post.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false })
        : null,
    }));
  }

  /**
   * 게시글 상세조회(views +1, preference는 버튼 누를 때 올라가는 거라 프론트에서 해줘야되는지?)
   * 로그인 안되있어도 됨
   *
   * @param postId
   */
  async getOnePost(postId: number) {
    const post = await this.prisma.posts.findUnique({ where: { postId }, include: { users: true } });
    if (!post || post.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    const updatePost = await this.prisma.posts.update({
      where: { postId: postId },
      data: { views: post.views + 1 },
      include: { users: true },
    });
    // return updatePost;
    const response = {
      postId: updatePost.postId,
      user: {
        userId: updatePost.users.userId,
        nickname: updatePost.users.userNickname,
      },
      title: updatePost.postTitle,
      content: updatePost.content,
      postType: updatePost.postType,
      image: updatePost.imageName,
      file: updatePost.fileName,
      preference: updatePost.preference,
      views: updatePost.views,
      position: updatePost.position,
      // createdAt: updatePost.createdAt,
      // updatedAt: updatePost.updatedAt,
      createdAt: new Date(updatePost.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false }),
      updatedAt: updatePost.updatedAt
        ? new Date(updatePost.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false })
        : null,
    };
    return { data: [response] };
  }

  async getProfileInPost(userId: number) {
    const user = await this.prisma.users.findUnique({ where: { userId } });
    if (!user) {
      throw new NotFoundException({ errorMessage: '존재하지 않는 사용자 입니다' });
    }

    // const response = {
    //   name: user.userName,
    // };

    return user;
  }

  /**
   * 게시글 생성
   * views 기본값 0
   * preference 기본값 0
   * 로그인 되어 있는지 확인
   * 본인인증하려고 가져온 userId 값을 post_userId에 넣기
   * @param createPostsDto
   * @returns
   */
  async createPost(
    postTitle: string,
    content: string,
    postType: string,
    position: string,
    fileName: string,
    skill: string[],
    file: Express.Multer.File
  ) {
    // const uploadedFile = await this.s3Service.imageUploadToS3(file);
    const imageName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const ext = file.originalname.split('.').pop();
    const imageUrl = await this.s3Service.imageUploadToS3(`${imageName}.${ext}`, file, ext);

    const post = await this.prisma.posts.create({
      data: {
        postTitle,
        content,
        postType,
        position,
        fileName,
        imageName: imageUrl,
        post_userId: 1, //userId를 받아서 넣어야함
        views: 0,
        preference: 0,

        createdAt: new Date(),
        // post_userId: userId
      },
    });
    return post;
  }

  /**
   *수정
   * 로그인 되어 있는지 확인
   * + reponse 값 수정
   * @param postId
   * @param updatePostsDto
   * @returns
   */
  async updatePost(postId: number, updatePostsDto: UpdatePostsDto) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
    }
    // if(existPost.post_userId !== userId){
    //   본인이 작성한 게시물 아님
    // }
    const post = await this.prisma.posts.update({
      where: { postId },
      data: {
        ...updatePostsDto,
        updatedAt: new Date(),
      },
    });
    // post.post_userId === userId
    return post;
  }

  /**
   *삭제
   * + 본인인증
   * + postId 게시글 존재 확인
   * @param postId
   * @param updatePostsDto
   * @returns
   */
  async deletePost(postId: number) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
    }
    // if(existPost.post_userId !== userId){
    //   본인 게시글만 삭제 가능 ForbiddenException
    // }

    const delPost = await this.prisma.posts.update({ where: { postId }, data: { deletedAt: new Date() } });
    return delPost;
  }
}
// async searchPosts(search: string) {
//   return await this.esService.search(search);
// }

// getAllPosts(cursor: string | undefined, limit: number) {
//   return this.prisma.posts.findMany({
//     where: { deletedAt: null },
//     select: {
//       postTitle: true,
//       post_userId: true,
//     },
//     take: limit,
//     skip: 1,
//     cursor: {
//       id: cursor,
//     },
// orderBy: {
//   id: 'desc',
// },
//   });
// }
//
