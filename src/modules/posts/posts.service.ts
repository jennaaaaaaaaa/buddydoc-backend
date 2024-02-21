import { Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { posts, Prisma } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { S3Service } from 'src/providers/aws/s3/s3.service';

// import { SearchService } from '../search/search.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private s3Service: S3Service
    // esService: SearchService
  ) {}

  /**
   * 목록조회 (+ 페이징, 최신순, 인기순<북마크많은순서>
   * 로그인 안되있어도 됨
   * @param orderField
   * @param lastPostId
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
        skillList: true,
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

    //반환된 게시글 수가 요청한 수보다 적을 때 true
    const isLastPage = posts.length < 10;

    return {
      posts: posts.map((post) => ({
        ...post,
        // createdAt: new Date(post.createdAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false }),
        // updatedAt: post.updatedAt
        //   ? new Date(post.updatedAt).toLocaleString('ko-KR', { timeZone: 'Asia/Seoul', hour12: false })
        //   : null,
        skillList: post.skillList.split(','),
      })),
      isLastPage,
    };
  }

  /**
   *
   * * 게시글 상세조회(views +1, preference는 버튼 누를 때 올라가는 거라 프론트에서 해줘야되는지?)
   * 로그인 안되있어도 됨
   * @param postId
   * @returns
   */
  async getOnePost(postId: number) {
    const post = await this.prisma.posts.findUnique({ where: { postId: +postId }, include: { users: true } });
    if (!post || post.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    const updatePost = await this.prisma.posts.update({
      where: { postId: +postId },
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
      createdAt: updatePost.createdAt,
      updatedAt: updatePost.updatedAt,
      skillList: post.skillList.split(','),
    };
    return { data: [response] };
  }

  /**
   * 게시글 참가 유저 프로필 조회
   * @param postId
   * @returns
   */
  async getParticipantsInPost(postId: number) {
    const post = await this.prisma.posts.findUnique({
      where: { postId: +postId },
      include: { users: { include: { skills: true } } },
    });
    if (!post || post.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '존재하지 않는 게시글 입니다' });
    }
    if (!post.users || post.users.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '존재하지 않는 사용자 입니다' });
    }

    const response = {
      postId: true,
      user: {
        userId: post.users.userId,
        nickname: post.users.userNickname,
        name: post.users.userName,
        gitURL: post.users.gitURL,
        userStatus: post.users.userStatus,
        introduction: post.users.introduction,
        career: post.users.career,
        skills: post.users.skills.map((skill) => skill.skill),
      },
    };

    return response;
  }

  // /**
  //  * 게시글 생성
  //  * views 기본값 0
  //  * preference 기본값 0
  //  * 로그인 되어 있는지 확인
  //  * 본인인증하려고 가져온 userId 값을 post_userId에 넣기
  //  * @param postTitle
  //  * @param content
  //  * @param postType
  //  * @param position
  //  * @param fileName
  //  * @param file
  //  * @returns
  //  */
  async createPost(
    postTitle: string,
    content: string,
    postType: string,
    position: string,
    image: Express.Multer.File,
    files: Express.Multer.File,
    skillList: string,
    deadLine: Date
  ) {
    const imageName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const imageExt = image.originalname.split('.').pop();
    const imageUrl = await this.s3Service.imageUploadToS3(`${imageName}.${imageExt}`, image, imageExt);

    const fileName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const fileExt = files.originalname.split('.').pop();
    const fileUrls = await this.s3Service.fileUploadToS3(`${fileName}.${fileExt}`, files, fileExt);

    const post = await this.prisma.posts.create({
      data: {
        postTitle,
        content,
        postType,
        position,
        imageName: imageUrl,
        fileName: fileUrls,
        skillList,
        deadLine,
        post_userId: 1, //userId를 받아서 넣어야함
        views: 0,
        preference: 0,
        createdAt: new Date(),
        // post_userId: userId
      },
    });

    // 새로운 객체를 만들고 필요한 데이터를 복사
    const response = {
      ...post,
      skillList: post.skillList.split(','),
    };

    return response;
  }

  /**
   *게시글 수정
   * @param postId
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param image
   * @param files
   * @param skillList
   * @param deadLine
   * @returns
   */
  async updatePost(
    postId: number,
    postTitle: string,
    content: string,
    postType: string,
    position: string,
    image: Express.Multer.File,
    files: Express.Multer.File,
    skillList: string,
    deadLine: Date
  ) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
    }
    // if(existPost.post_userId !== userId){
    //   본인이 작성한 게시물 아님
    // }

    const imageName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const imageExt = image.originalname.split('.').pop();
    const imageUrl = await this.s3Service.imageUploadToS3(`${imageName}.${imageExt}`, image, imageExt);

    const fileName = new Date().toISOString().replace(/:/g, '-').replace(/\./g, '-');
    const fileExt = files.originalname.split('.').pop();
    const fileUrls = await this.s3Service.fileUploadToS3(`${fileName}.${fileExt}`, files, fileExt);

    const post = await this.prisma.posts.update({
      where: { postId },
      data: {
        postTitle,
        content,
        postType,
        position,
        imageName: imageUrl,
        fileName: fileUrls,
        skillList,
        deadLine,
        updatedAt: new Date(),
        // post_userId: userId
      },
    });

    const response = {
      ...post,
      skillList: post.skillList.split(','),
    };
    return response;
  }

  /**
   * 삭제
   * 본인인증
   * @param postId
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

  /**
   * 북마크 추가/제거
   * @param userId
   * @param postId
   * @returns
   */
  async toggleBookmark(userId: number, postId: number) {
    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: postId,
        },
      },
    });

    if (bookmark) {
      const deleteBookmark = this.prisma.bookmarks.delete({
        where: {
          userId_postId: {
            userId: userId,
            postId: postId,
          },
        },
      });
      const decreasePreference = this.prisma.posts.update({
        where: { postId: postId },
        data: { preference: { decrement: 1 } },
        select: { preference: true },
      });

      const [_, updatedPost] = await this.prisma.$transaction([deleteBookmark, decreasePreference]);

      return { preference: updatedPost.preference }; // 변경된 preference 값 반환
    } else {
      const createBookmark = this.prisma.bookmarks.create({
        data: {
          userId: userId,
          postId: postId,
          createdAt: new Date(),
        },
      });
      const increasePreference = this.prisma.posts.update({
        where: { postId: postId },
        data: { preference: { increment: 1 } },
        select: { preference: true },
      });

      const [_, updatedPost] = await this.prisma.$transaction([createBookmark, increasePreference]);

      return { preference: updatedPost.preference }; // 변경된 preference 값 반환
    }
  }
}
