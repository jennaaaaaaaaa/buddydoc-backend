import { Injectable, NotFoundException, UploadedFile } from '@nestjs/common';
import { PrismaService } from '../../database/prisma/prisma.service';
import { posts, Prisma } from '@prisma/client';
import { CreatePostsDto } from './dto/create-post.dto';
import { UpdatePostsDto } from './dto/update-post.dto';
import { S3Service } from 'src/providers/aws/s3/s3.service';

@Injectable()
export class PostService {
  constructor(
    private prisma: PrismaService
    // esService: SearchService
  ) {}

  /**
   * 목록조회 (+ 페이징, 최신순, 인기순<북마크많은순서>
   * 로그인 안되있어도 됨
   * @param orderField
   * @param lastPostId
   * @returns
   */

  // //스터디랑 사이드프로젝트 게시물 나눠서 보여주기 postType이 스터디면 스터디만, ...
  // async getAllPosts(orderField: 'createdAt' | 'preference', postType?: 'study' | 'project', lastPostId?: number) {
  //   //whereCondition은 Prisma.PostsWhereInput 타입의 변수로서, 초기 조건으로 deletedAt이 null인 데이터를 대상으로 설정
  //   let whereCondition: Prisma.postsWhereInput = { deletedAt: null };

  //   if (postType) {
  //     whereCondition = {
  //       ...whereCondition,
  //       postType: postType,
  //     };
  //   }

  //   if (lastPostId) {
  //     whereCondition = {
  //       ...whereCondition,
  //       postId: {
  //         lt: lastPostId,
  //       },
  //     };
  //   }

  //   const posts = await this.prisma.posts.findMany({
  //     where: whereCondition,
  //     orderBy: { [orderField]: 'desc' }, //인기순, 최신순
  //     take: 10, //10개씩,  prisma에서 제공하는 옵션 기능
  //     select: {
  //       postId: true,
  //       postTitle: true,
  //       position: true,
  //       postType: true,
  //       preference: true,
  //       views: true,
  //       skillList: true,
  //       deadLine: true,
  //       startDate: true,
  //       memberCount: true,
  //       createdAt: true,
  //       updatedAt: true,
  //       post_userId: true,
  //       users: {
  //         select: {
  //           userNickname: true,
  //         },
  //       },
  //     },
  //   });

  //   //반환된 게시글 수가 요청한 수보다 적을 때 true
  //   const isLastPage = posts.length < 10;

  //   const postsWithBookmark = await Promise.all(
  //     posts.map(async (post) => {
  //       let bookmark = false;
  //       const userId = 2; //임시값
  //       if (userId) {
  //         const userBookmark = await this.prisma.bookmarks.findUnique({
  //           where: {
  //             userId_postId: {
  //               userId: userId,
  //               postId: post.postId,
  //             },
  //           },
  //         });
  //         bookmark = !!userBookmark;
  //       }

  //       return {
  //         ...post,
  //         bookmark,
  //         position: post.position ? post.position.split(',') : [],
  //         skillList: post.skillList ? post.skillList.split(',') : [],
  //       };
  //     })
  //   );
  //   return {
  //     posts: postsWithBookmark,
  //     isLastPage,
  //   };
  // }

  async getAllPosts(orderField: 'createdAt' | 'preference', postType?: 'study' | 'project', lastPostId?: number) {
    let whereCondition: Prisma.postsWhereInput = { deletedAt: null };

    if (postType) {
      whereCondition = {
        ...whereCondition,
        postType: postType,
      };
    }

    const posts = await this.prisma.posts.findMany({
      where: whereCondition,
      orderBy: { [orderField]: 'desc' }, //인기순, 최신순
      take: 11, //한번에 11개씩 불러옴
      cursor: lastPostId ? { postId: lastPostId } : undefined, // cursor 추가
      skip: lastPostId ? 1 : undefined, // cursor가 가리키는 레코드를 제외
      //11번은 제외해서 10개만 조회되는 것, 11번째 게시물은 다음 페이지가 있는지 없는지를 판단하기 위한 용도로 사용
      select: {
        postId: true,
        postTitle: true,
        position: true,
        postType: true,
        preference: true,
        views: true,
        skillList: true,
        deadLine: true,
        startDate: true,
        memberCount: true,
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

    const isLastPage = posts.length < 10; // 11개 미만이면 마지막 페이지
    if (!isLastPage) {
      posts.pop();
    } // 마지막 요소 제거

    const postsWithBookmark = await Promise.all(
      posts.map(async (post) => {
        let bookmark = false;
        const userId = 2; //임시값
        if (userId) {
          const userBookmark = await this.prisma.bookmarks.findUnique({
            where: {
              userId_postId: {
                userId: userId,
                postId: post.postId,
              },
            },
          });
          bookmark = !!userBookmark;
        }

        return {
          ...post,
          bookmark,
          position: post.position ? post.position.split(',') : [],
          skillList: post.skillList ? post.skillList.split(',') : [],
        };
      })
    );
    return {
      posts: postsWithBookmark,
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

    const bookmark = await this.prisma.bookmarks.findUnique({
      where: {
        userId_postId: {
          userId: userId,
          postId: post.postId,
        },
      },
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
      preference: updatePost.preference,
      views: updatePost.views,
      position: updatePost.position ? updatePost.position.split(',') : [],
      createdAt: updatePost.createdAt,
      updatedAt: updatePost.updatedAt,
      skillList: updatePost.skillList ? updatePost.skillList.split(',') : [],
      deadLine: updatePost.deadLine,
      startDate: updatePost.startDate,
      memberCount: updatePost.memberCount,
      bookmarked: !!bookmark,
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
        profileImage: post.users.profileImage,
        userStatus: post.users.userStatus,
        introduction: post.users.introduction,
        career: post.users.career,
        skills: post.users.skills.map((skill) => skill.skill),
      },
    };

    return response;
  }

  /**
   * 게시글 생성
   * @param postTitle
   * @param content
   * @param postType
   * @param position
   * @param skillList
   * @param deadLine
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
    memberCount: number
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
      position: post.position ? post.position.split(',') : [],
      skillList: post.skillList ? post.skillList.split(',') : [],
    };

    return response;
  }

  /**
   * 게시글 수정
   * @param postId
   * @param postTitle
   * @param content
   * @param postType
   * @param position
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
    skillList: string,
    deadLine: Date,
    startDate: Date,
    memberCount: number
  ) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId: +postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
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
        updatedAt: new Date(),
      },
    });

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
  async deletePost(postId: number) {
    const existPost = await this.prisma.posts.findUnique({ where: { postId: +postId } });
    if (!existPost || existPost.deletedAt !== null) {
      throw new NotFoundException({ errorMessage: '해당하는 게시글이 존재하지 않습니다.' });
    }
    // if(existPost.post_userId !== userId){
    //   본인 게시글만 삭제 가능 ForbiddenException
    // }

    const delPost = await this.prisma.posts.update({ where: { postId: +postId }, data: { deletedAt: new Date() } });
    return delPost;
  }

  /**
   * 북마크 추가/제거
   * @param userId
   * @param postId
   * @returns
   */
  async toggleBookmark(userId: number, postId: number) {
    //컨트롤러에서 user를 가져와서 user테이블에서 user찾기 user가 없다면 에러처리
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
          userId: userId,
          postId: postId,
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
