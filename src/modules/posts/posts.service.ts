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

  // async getAllPosts(orderField: 'createdAt' | 'preference', postType?: 'study' | 'project', lastPostId?: number)
  async getAllPosts(
    userId: number,
    isEnd: 0 | 1,
    postType?: 'study' | 'project',
    lastPostId?: number

    // orderField: 'createdAt' | 'preference',
    // orderField: 'createdAt' | 'preference',
  ) {
    // let whereCondition: Prisma.postsWhereInput = { deletedAt: null };
    // if (postType) {
    //   whereCondition = {
    //     ...whereCondition,
    //     postType: postType,
    //   };
    // }
    // const posts = await this.prisma.posts.findMany({
    //   where: whereCondition,
    //   orderBy: { [orderField]: 'desc' }, //인기순, 최신순
    //   take: 10, //한번에 11개씩 불러옴
    //   cursor: lastPostId ? { postId: lastPostId } : undefined, // cursor 추가
    //   skip: lastPostId ? 1 : undefined, // cursor가 가리키는 레코드를 제외
    //   //11번은 제외해서 10개만 조회되는 것, 11번째 게시물은 다음 페이지가 있는지 없는지를 판단하기 위한 용도로 사용
    //   select: {
    //     postId: true,
    //     postTitle: true,
    //     position: true,
    //     postType: true,
    //     preference: true,
    //     views: true,
    //     skillList: true,
    //     deadLine: true,
    //     startDate: true,
    //     memberCount: true,
    //     createdAt: true,
    //     updatedAt: true,
    //     post_userId: true,
    //     users: {
    //       select: {
    //         userNickname: true,
    //       },
    //     },
    //   },
    // });
    // const isLastPage = posts.length < 10; // 11개 미만이면 마지막 페이지
    // if (!isLastPage) {
    //   posts.pop();
    // } // 마지막 요소 제거
    // const postsWithBookmark = await Promise.all(
    //   posts.map(async (post) => {
    //     let bookmark = false;
    //     if (userId) {
    //       const userBookmark = await this.prisma.bookmarks.findUnique({
    //         where: {
    //           userId_postId: {
    //             userId: userId,
    //             postId: post.postId,
    //           },
    //         },
    //       });

    //       console.log(userBookmark, !userBookmark, !!user)
    //       bookmark = !!userBookmark;
    //     }
    //     return {
    //       ...post,
    //       bookmark,
    //       position: post.position ? post.position.split(',') : [],
    //       skillList: post.skillList ? post.skillList.split(',') : [],
    //     };
    //   })
    // );
    // return {
    //   posts: postsWithBookmark,
    //   isLastPage,
    // };

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
    // const rawPosts: PostWithBookmark[] = await this.prisma.$queryRaw`
    //   SELECT posts.*,
    //   CASE WHEN bookmarks.postId IS NOT NULL THEN TRUE ELSE FALSE END AS is_bookmarked
    //   FROM posts
    //   LEFT JOIN bookmarks ON posts.postId = bookmarks.postId AND bookmarks.userId = ${userId}
    //   WHERE posts.deletedAt IS NULL
    //   ${postType ? Prisma.sql`AND posts.postType = ${postType}` : Prisma.empty}
    //   ${lastPostId ? Prisma.sql`AND posts.postId < ${lastPostId}` : Prisma.empty}
    //   ORDER BY posts.createdAt DESC
    //   LIMIT ${limit}
    // `;

    const rawPosts: PostWithBookmark[] = await this.prisma.$queryRaw`
      SELECT posts.*, 
      CASE WHEN bookmarks.postId IS NOT NULL THEN TRUE ELSE FALSE END AS is_bookmarked
      CASE WHEN posts.deadLine < CURRENT_DATE THEN 'y' ELSE 'n' END AS isEnd
      FROM posts 
      LEFT JOIN bookmarks ON posts.postId = bookmarks.postId AND bookmarks.userId = ${userId}
      WHERE posts.deletedAt IS NULL

      ${isEnd === 0 ? Prisma.sql`AND posts.deadLine > CURDATE()` : Prisma.empty}

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

    // console.log('postsWithBookmark.length', postsWithBookmark.length);

    return {
      posts: postsWithBookmark,
      isLastPage: postsWithBookmark.length < 10, //반환된 게시글 수가 요청한 수보다 적을 때 true
    };
  }

  /**
   * * 게시글 상세조회(views +1, preference는 버튼 누를 때 올라가는 거라 프론트에서 해줘야되는지?)
   * 로그인 안되있으면 북마크 기본 false값
   * 조회수 본인은 view 안 올라감
   * 유저 이미지 추가
   *
   * @param postId
   * @returns
   */
  async getOnePost(postId: number, userId: number) {
    try {
      let post = await this.prisma.posts.findUnique({ where: { postId: +postId }, include: { users: true } });

      if (!post || post.deletedAt !== null) {
        throw new NotFoundException({ errorMessage: '게시글이 존재하지 않습니다.' });
      }

      console.log('post.post_userId: 게시글 작성자:', post.post_userId);
      console.log('userId: 로그인 한 사람, null값 이면 로그인 안되어있는 상태::', userId);
      if (post.post_userId !== userId) {
        await this.prisma.posts.update({ where: { postId: +postId }, data: { views: post.views + 1 } });
        post = await this.prisma.posts.findUnique({ where: { postId: +postId }, include: { users: true } });
      }

      //views는 작성자본인이 조회 할 땐 증가하지 않음

      if (userId) {
        const bookmarked = await this.prisma.bookmarks.findUnique({
          where: { userId_postId: { postId: +postId, userId: +userId } },
        });

        const response = {
          postId: post.postId,
          //게시글 작성자 정보
          user: {
            userId: post.users.userId,
            userNickname: post.users.userNickname,
            profileImage: post.users.profileImage,
          },
          postTitle: post.postTitle,
          content: post.content,
          postType: post.postType,
          preference: post.preference,
          views: post.views,
          position: post.position ? post.position.split(',') : [],
          createdAt: post.createdAt,
          updatedAt: post.updatedAt,
          skillList: post.skillList ? post.skillList.split(',') : [],
          deadLine: post.deadLine,
          startDate: post.startDate,
          memberCount: post.memberCount,
          period: post.period,
        };

        return { ...response, isBookmarked: Boolean(bookmarked) };
      }

      const response = {
        postId: post.postId,
        //게시글 작성자 정보
        user: {
          userId: post.users.userId,
          userNickname: post.users.userNickname,
          profileImage: post.users.profileImage,
        },
        postTitle: post.postTitle,
        content: post.content,
        postType: post.postType,
        preference: post.preference,
        views: post.views,
        position: post.position ? post.position.split(',') : [],
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        skillList: post.skillList ? post.skillList.split(',') : [],
        deadLine: post.deadLine,
        startDate: post.startDate,
        memberCount: post.memberCount,
        period: post.period,
      };

      return { ...response, isBookmarked: false };
    } catch (error) {
      console.error(error);
    }

    //로그인하지 않은 사용자가 게시글을 조회할 때 bookmarked 프로퍼티가 false로 설정

    // // return updatePost;
    // const response = {
    //   postId: updatePost.postId,
    //   user: {
    //     userId: updatePost.users.userId,
    //     nickname: updatePost.users.userNickname,
    //     profileImage: updatePost.users.profileImage,
    //   },
    //   title: updatePost.postTitle,
    //   content: updatePost.content,
    //   postType: updatePost.postType,
    //   preference: updatePost.preference,
    //   views: updatePost.views,
    //   position: updatePost.position ? updatePost.position.split(',') : [],
    //   createdAt: updatePost.createdAt,
    //   updatedAt: updatePost.updatedAt,
    //   skillList: updatePost.skillList ? updatePost.skillList.split(',') : [],
    //   deadLine: updatePost.deadLine,
    //   startDate: updatePost.startDate,
    //   memberCount: updatePost.memberCount,
    //   period: updatePost.period,
    //   bookmarked: !!bookmark,
    // };
    // return { data: [response] };
  }

  /**
   * 신청하면 승인된 사람만 조회
   * @param postId
   * @returns
   */
  async getParticipantsInPost(postId: number) {
    try {
      const participatingUsers = await this.prisma.notifications.findMany({
        where: {
          postId: +postId,
          notiStatus: 'accept',
        },
        select: {
          noti_userId: true,
          users: {
            select: {
              profileImage: true,
              userNickname: true,
              career: true,
              position: true,
              gitURL: true,
              skills: {
                select: {
                  skill: true,
                },
              },
            },
          },
        },
      });

      const usersWithSkillsArray = participatingUsers.map((user) => ({
        ...user,
        users: {
          ...user.users,
          skills: user.users.skills.map((skillObj) => skillObj.skill),
          position: user.users.position ? user.users.position.split(',') : [],
        },
      }));

      return { data: usersWithSkillsArray };
    } catch (error) {
      console.error(error);
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
   * @param startDate
   * @param memberCount
   * @param period
   * @returns
   */
  async createPost(
    postTitle: string,
    content: string,
    postType: string,
    position: string[],
    skillList: string[],
    deadLine: Date,
    startDate: Date,
    memberCount: number,
    period: string,
    userId: number
  ) {
    const skillListString = skillList.join(',');
    const positionString = position.join(',');
    const post = await this.prisma.posts.create({
      data: {
        postTitle,
        content,
        postType,
        position: positionString,
        skillList: skillListString,
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
    position: string[],
    skillList: string[],
    deadLine: Date,
    startDate: Date,
    memberCount: number,
    period: string,
    userId: number
  ) {
    const skillListString = skillList.join(',');
    const positionString = position.join(',');
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
        position: positionString,
        skillList: skillListString,
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
  async toggleBookmark(userId: number, postId: string) {
    // postId와 userId가 유효한지 확인
    const post = await this.prisma.posts.findUnique({ where: { postId: +postId } });
    const user = await this.prisma.users.findUnique({ where: { userId: userId } });
    if (!post) {
      throw new Error('Post not found(존재하지 않는 게시글 입니다)');
    }
    if (!user) {
      throw new Error('User not found(존재하지 않는 유저 입니다)');
    }

    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: +postId,
        },
      },
    });

    console.log('bookmark 값이 null 이면 북마크 데이터에 추가됨', bookmark);

    if (bookmark) {
      const deleteBookmark = this.prisma.bookmarks.delete({
        where: {
          userId_postId: {
            userId: userId,
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
      const createBookmark = this.prisma.bookmarks.create({
        data: {
          userId: userId,
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
