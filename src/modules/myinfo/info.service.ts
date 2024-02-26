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
        userName: true,
        userNickname: true,
        position: true,
        skills: {
          select: {
            skill: true,
          },
        },
      },
    });

    const result = {
      userId: user.userId,
      userName: user.userName,
      userNickname: user.userNickname,
      position: user.position,
      skills: user.skills.map((skill) => skill.skill),
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

    const user = await this.prisma.$queryRaw`select b.postId,b.postTitle,b.post_userId,
    a.userId, c.userNickName
    from 
    bookmarks a
    join
    posts b 
    on a.postId = b.postId
    join 
    users c 
    on b.post_userId = c.userId
    where a.userId = ${Number(infoDto.userId)}`;

    return user;
  }

  /**
   * 내 참여 스터디 조회
   * @param userDto
   * @returns 게시글번호,게시글제목,게시글타입,게시글작성자
   */
  async getStudylists(infoDto: InfoDto) {
    console.log(`스터디`);
    const user = await this.prisma.$queryRaw`select b.postId,b.postTitle,b.postType,
    b.post_userId,a.userId,c.userNickName
    from
    studylists a
    join
    posts b 
    on a.postId = b.postId
    join 
    users c 
    on b.post_userId = c.userId
    where a.userId = ${Number(infoDto.userId)}`;

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
      },
      select: {
        postId: true,
        postTitle: true,
        postType: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return user;
  }
}
