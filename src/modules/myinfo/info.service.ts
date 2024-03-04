import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { InfoDto } from '../myinfo/dto/info.dto';

@Injectable()
export class InfoService {
  constructor(private prisma: PrismaService) {}

  /**
   * 내 정보 조회
   * @param userDto
   * @returns users skills 조회
   */
  async getUserInfo(infoDto: InfoDto) {
    console.log('getUserInfo >>> ', infoDto.userId);
    const user = await this.prisma.users.findUnique({
      where: {
        userId: Number(infoDto.userId),
      },
      select: {
        userId: true,
        userNickname: true,
        profileImage: true,
        position: true,
        career: true,
        skills: {
          select: {
            skill: true,
          },
        },
      },
    });

    const result = {
      userId: user.userId,
      userNickname: user.userNickname,
      profileImage: user.profileImage,
      position: user.position,
      career: user.career,
      skillList: user.skills.map((skill) => skill.skill),
    };

    return result;
  }

  /**
   * 내 북마크 조회
   * @param userDto
   * @returns 게시글번호,게시물제목,게시글작성자
   */
  async getBookmarks(infoDto: InfoDto) {
    console.log(`북마크`);

    const user = await this.prisma.$queryRaw`
    select b.postId,b.postTitle,b.postType
    ,b.deadLine,b.memberCount
    from 
    bookmarks a
    join
    posts b 
    on a.postId = b.postId
    join 
    users c 
    on b.post_userId = c.userId
    where a.userId = ${Number(infoDto.userId)}
    order by a.createdAt desc`;

    return user;
  }

  /**
   * 내 참여목록 조회
   * @param userDto
   * @returns 게시글번호,게시글제목,게시글타입,게시글작성자
   */
  async getStudylists(infoDto: InfoDto) {
    console.log(`스터디 , 프로젝트`);
    const user = await this.prisma.$queryRaw`
    select postId, postTitle, postType , memberCount ,startDate from posts
    where post_userId = ${Number(infoDto.userId)} and deletedAt is null
    order by createdAt desc`;

    return user;
  }

  /**
   * 내 신청현황 조회
   * @param userDto
   * @returns 게시글번호,게시글제목,게시글타입,게시글작성자
   */
  async getNotifications(infoDto: InfoDto) {
    console.log(`신청현황`);
    const user = await this.prisma.$queryRaw`
    select
    b.postType,b.postTitle,b.memberCount,
    a.notiStatus,b.postId,b.startDate,a.createdAt
    from notifications a 
    join posts b 
    on a.postId = b.postId
    where noti_userId = ${Number(infoDto.userId)}
    order by a.createdAt desc`;

    return user;
  }
  /**
   * 내 작성 게시물 조회
   * @param userDto
   * @returns 게시글번호,게시글제목,게시글타입 orderby 글 작성 최신순
   */
  async getPosts(infoDto: InfoDto) {
    console.log(`게시물`);
    const user = await this.prisma.posts.findMany({
      where: {
        post_userId: Number(infoDto.userId),
        deletedAt: null
      },
      select: {
        postId: true,
        postTitle: true,
        postType: true,
        createdAt: true,
        deadLine: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return user;
  }

  /**
   * 신청자 관리
   * @param postId 
   * @returns 
   */
  async getApplicants(postId: Number) {
    console.log(`신청자`);
    const user = await this.prisma.$queryRaw`
    select a.noti_userId,b.userNickname,a.noti_message,a.position
    from notifications a 
    join users b 
    on a.noti_userId=b.userId
    where a.postId=${postId}
    order by a.createdAt `;

    return user;
  }
}
