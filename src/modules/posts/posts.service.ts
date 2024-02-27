import { ForbiddenException, Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { posts, Prisma } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { S3Service } from 'src/providers/aws/s3/s3.service';
import { SearchService } from './search/search.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService,
    private searchService: SearchService
  ) {}

  /**
   * 목록조회 (+ 페이징, 최신순, 인기순<북마크많은순서>
   * 로그인 안되있어도 됨
   * @param orderField
   * @param lastPostId
   * @returns
   */
  async getAllPosts(
    userId: number,
    postType?: 'study' | 'project',
    lastPostId?: number
    // orderField: 'createdAt' | 'preference',
    // orderField: 'createdAt' | 'preference',
  ) {
    type PostWithBookmark = {
      postId: number;
      position: string | null;
      postType: string | null;
      preference: number;
      views: number;
      createdAt: Date | null;
      updatedAt: Date | null;
      post_userId: number | null;
      skillList: string | null;
      deadLine: Date | null;
      memberCount: number | null;
      startDate: Date | null;
      period: string | null;
      is_bookmarked: boolean;
    };

    // let rawPosts: PostWithBookmark[];

    let limit = 10; //10개씩 게시물 조회
    const rawPosts: PostWithBookmark[] = await this.prisma.$queryRaw`
      SELECT posts.*, 
      CASE WHEN bookmarks.postId IS NOT NULL THEN TRUE ELSE FALSE END AS is_bookmarked
      FROM posts 
      LEFT JOIN bookmarks ON posts.postId = bookmarks.postId AND bookmarks.userId = ${userId}
      WHERE posts.deletedAt IS NULL
      ${postType ? Prisma.sql`AND posts.postType = ${postType}` : Prisma.empty}
      ${lastPostId ? Prisma.sql`AND posts.postId < ${lastPostId}` : Prisma.empty}
      ORDER BY posts.createdAt DESC
      LIMIT ${limit}
    `;

    //인기순 정렬 추가 무한루푸 문제
    // let orderBy = 'preference'
    // const rawPosts: PostWithBookmark[] = await this.prisma.$queryRaw`
    //   SELECT posts.*,
    //   CASE WHEN bookmarks.postId IS NOT NULL THEN TRUE ELSE FALSE END AS is_bookmarked
    //   FROM posts
    //   LEFT JOIN bookmarks ON posts.postId = bookmarks.postId AND bookmarks.userId = ${userId}
    //   WHERE posts.deletedAt IS NULL
    //   ${postType ? Prisma.sql`AND posts.postType = ${postType}` : Prisma.empty}
    //   ${lastPostId ? Prisma.sql`AND posts.postId < ${lastPostId}` : Prisma.empty}
    //   ORDER BY ${orderField === 'preference' ? 'posts.preference DESC' : 'posts.createdAt DESC'}
    //   LIMIT ${limit}
    // `;

    const postsWithBookmark = rawPosts.map((post) => ({
      ...post,
      is_bookmarked: Boolean(Number(post.is_bookmarked)), // BigInt to boolean
      skillList: post.skillList ? post.skillList.split(',') : [],
      position: post.position ? post.position.split(',') : [],
    }));

    console.log('postsWithBookmark.length', postsWithBookmark.length);
    console.log('rawPosts.length', rawPosts.length);

    return {
      posts: postsWithBookmark,
      isLastPage: postsWithBookmark.length < 10, //반환된 게시글 수가 요청한 수보다 적을 때 true
    };
  }

  /**
   * * 게시글 상세조회(views +1, preference는 버튼 누를 때 올라가는 거라 프론트에서 해줘야되는지?)
   * 로그인 안되있으면 북마크 기본 false값
   * @param postId
   * @returns
   */
  async getOnePost(postId: number, userId: number) {
    const post = await this.prisma.posts.findUnique({ where: { postId: +postId }, include: { users: true } });
    if (!post || post.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '게시글이 존재하지 않습니다.' });
    }
    const updatePost = await this.prisma.posts.update({
      where: { postId: +postId },
      data: { views: post.views + 1 },
      include: { users: true },
    });

    let bookmark;
    if (userId) {
      //유저 아이디가 있다면
      bookmark = await this.prisma.bookmarks.findUnique({
        where: {
          userId_postId: {
            userId: userId,
            postId: post.postId,
          },
        },
      });
    }
    //로그인하지 않은 사용자가 게시글을 조회할 때 bookmarked 프로퍼티가 false로 설정

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
      preference: updatePost.preference,
      views: updatePost.views,
      position: updatePost.position ? updatePost.position.split(',') : [],
      createdAt: updatePost.createdAt,
      updatedAt: updatePost.updatedAt,
      skillList: updatePost.skillList ? updatePost.skillList.split(',') : [],
      deadLine: updatePost.deadLine,
      startDate: updatePost.startDate,
      memberCount: updatePost.memberCount,
      period: updatePost.period,
      bookmarked: !!bookmark,
    };
    return { data: [response] };
  }

  // /**
  //  * 게시글 참가 유저 프로필 조회
  //  * @param postId
  //  * @returns
  //  */
  // async getParticipantsInPost(postId: number) {
  //   const users = await this.prisma.applications.findMany({
  //     where: {postId: +postId},
  //     select: {userId: true}
  //   })

  //   // 가져온 데이터에서 userId만 추출하여 배열
  // const userIds = users.map(user => user.userId);

  //   const post = await this.prisma.posts.findUnique({
  //     where: { postId: +postId },
  //     include: { users: { include: { skills: true } } },
  //   });
  //   if (!post || post.deletedAt !== null) {
  //     throw new NotFoundException({ errorMessage: '존재하지 않는 게시글 입니다' });
  //   }
  //   if (!post.users || post.users.deletedAt !== null) {
  //     throw new NotFoundException({ errorMessage: '존재하지 않는 사용자 입니다' });
  //   }

  //   const response = {
  //     postId: true,
  //     post_userId: {
  //       user: {
  //         userId: post.users.userId,
  //         nickname: post.users.userNickname,
  //         name: post.users.userName,
  //         gitURL: post.users.gitURL,
  //         profileImage: post.users.profileImage,
  //         userStatus: post.users.userStatus,
  //         introduction: post.users.introduction,
  //         career: post.users.career,
  //         skills: post.users.skills.map((skill) => skill.skill),
  //       },
  //     },

  //   };

  //   return response;
  // }

  // async getApplicationUsersByPost(postId: number) {
  //   // applications 테이블에서 postId에 해당하는 모든 데이터
  //   const applications = await this.prisma.applications.findMany({
  //     where: { postId: postId },
  //   });

  //   // 가져온 데이터에서 userId만 추출하여 배열로 만듭니다.
  //   const userIds = applications.map(application => application.userId);

  //   // userIds를 사용하여 users 테이블에서 사용자 정보를 조회합니다.
  //   const users = await this.prisma.users.findMany({
  //     where: { userId: { in: userIds } }, // userId가 userIds 배열에 포함된 경우를 조회합니다.
  //   });

  //   // 각 사용자의 정보를 문자열로 만듭니다.
  //   const usersInfo = users.map(user => `userId: ${user.userId}, userName: ${user.userName}, userNickname: ${user.userNickname}`).join(', ');

  //   return { postId, usersInfo };
  // }

  /**
   *
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
  async createPost(
    postTitle: string,
    content: string,
    postType: string,
    position: string,
    skillList: string,
    deadLine: Date,
    startDate: Date,
    memberCount: number,
    period: string,
    userId: number
  ) {
    const post = await this.prisma.posts.create({
      data: {
        postTitle,
        content,
        postType,
        position,
        skillList,
        deadLine,
        startDate,
        memberCount,
        period,
        post_userId: +userId,
        views: 0,
        preference: 0,
        createdAt: new Date(),
      },
    });

    // elasticsearch 사용시 주석 풀어야함
    // Elasticsearch에 인덱싱
    // await this.searchService.addDocument([post]);

    // 새로운 객체를 만들고 필요한 데이터를 복사
    const response = {
      ...post,
      position: post.position ? post.position.split(',') : [],
      skillList: post.skillList ? post.skillList.split(',') : [],
    };

    return response;
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
  async updatePost(
    postId: number,
    postTitle: string,
    content: string,
    postType: string,
    position: string,
    skillList: string,
    deadLine: Date,
    startDate: Date,
    memberCount: number,
    period: string,
    userId: number
  ) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId: +postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
    }

    if (existPost.post_userId !== userId) {
      throw new ForbiddenException({ errorMessage: '게시글 작성자만 수정 가능합니다.' });
    }

    const post = await this.prisma.posts.update({
      where: { postId: +postId },
      data: {
        postTitle,
        content,
        postType,
        position,
        skillList,
        deadLine,
        startDate,
        memberCount,
        period,
        updatedAt: new Date(),
      },
    });

    // elasticsearch 사용시 주석 풀어야함
    // Elasticsearch에 인덱싱된 데이터 업데이트
    // await this.searchService.updateDocument(postId, post);

    // 새로운 객체를 만들고 필요한 데이터를 복사
    const response = {
      ...post,
      position: post.position ? post.position.split(',') : [],
      skillList: post.skillList ? post.skillList.split(',') : [],
    };

    return response;
  }

  /**
   * 삭제
   * 본인인증
   * @param postId
   * @returns
   */
  async deletePost(postId: number, userId: number) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId: +postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
    }
    if (existPost.post_userId !== userId) {
      throw new ForbiddenException({ errorMessage: '게시글 작성자만 삭제 가능합니다.' });
    }

    const delPost = await this.prisma.posts.update({ where: { postId: +postId }, data: { deletedAt: new Date() } });

    // Elasticsearch 인덱스에서 해당 문서 삭제
    // const deleteResult = await this.searchService.deleteDoc(postId);
    // console.log('deleteResult ====>>>>', deleteResult);

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
          userId: +userId,
          postId: +postId,
        },
      },
    });

    if (bookmark) {
      const deleteBookmark = this.prisma.bookmarks.delete({
        where: {
          userId_postId: {
            userId: +userId,
            postId: +postId,
          },
        },
      });
      const decreasePreference = this.prisma.posts.update({
        where: { postId: +postId },
        data: { preference: { decrement: 1 } },
        select: { preference: true },
      });

      const [_, updatedPost] = await this.prisma.$transaction([deleteBookmark, decreasePreference]);

      return { preference: updatedPost.preference, bookmarked: false }; // 변경된 preference 값 반환
    } else {
      // const user = await this.prisma.users.findUnique({
      //   where: { userId: userId },
      // });
      // if (!user) {
      //   throw new Error('User not found');
      // }
      const createBookmark = this.prisma.bookmarks.create({
        data: {
          userId: +userId,
          postId: +postId,
          createdAt: new Date(),
        },
      });
      const increasePreference = this.prisma.posts.update({
        where: { postId: +postId },
        data: { preference: { increment: 1 } },
        select: { preference: true },
      });

      const [_, updatedPost] = await this.prisma.$transaction([createBookmark, increasePreference]);

      return { preference: updatedPost.preference, bookmarked: true }; // 변경된 preference 값 반환
    }
  }
}
