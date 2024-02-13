import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { InfoDto } from './dto/info.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 회원생성
   * @param usersDto
   * @returns prisma create 결과
   */
  async createUser(usersDto: UserDto) {
    try {
      const { email, userName, userNickname, userTokken, position, gitURL, userStatus, introduction, career } =
        usersDto;

      //dto 값을 entity 값으로 매핑 후 데이터에 넣어야하는가?
      // or 데이터 에 넣은값을 entitiy에 매핑후 핸들링 해야 하는가?
      const user = await this.prisma.users.create({
        data: {
          email,
          userName,
          userNickname,
          userTokken,
          position,
          gitURL,
          userStatus: 'public', // 임시로 고정값
          introduction,
          career: Number(career),
          createdAt: new Date(),
        },
      });

      return user;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * userId로 기술스택 row 생성
   * @param userId
   * @param userSkills
   * @returns prisma create 결과
   */
  async insertSkills(userId: number, userSkills: string) {
    try {
      //validation 은 추가로 정의 (',' ' ' '그외' )
      const skills = userSkills.split(',');

      const skillObj = skills.map((skill) => ({
        userId: userId,
        skill: skill.trim(),
        createdAt: new Date(),
      }));

      let skill = await this.prisma.skills.createMany({ data: skillObj });

      return skill;
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 내 정보 조회
   * @param userDto 
   * @returns users skills 조회
   */
  async getUserInfo(infoDto: InfoDto) {
    console.log('getUserInfo >>> ', infoDto.userId);
    const user = await this.prisma.$queryRaw`
    select a.userId,a.userName,a.userNickName,
    a.position,GROUP_CONCAT(DISTINCT b.skill) as skills from
    users a join
    skills b on
    a.userId = b.userId
    where a.userId = ${Number(infoDto.userId)}
    `;
    return user;
  }

  /**
   * 내 북마크 조회
   * @param userDto 
   * @returns 게시글번호,게시물제목,게시글작성자
   */
  async getBookmarks(infoDto: InfoDto) {
    console.log(`북마크`);

    const user = await this.prisma.$queryRaw
    `select b.postId,b.postTitle,b.post_userId,
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

    return user
  }

  /**
   * 내 참여 스터디 조회
   * @param userDto 
   * @returns 게시글번호,게시글제목,게시글타입,게시글작성자
   */
  async getStudylists(infoDto: InfoDto) {
    console.log(`스터디`);
    const user = await this.prisma.$queryRaw
    `select b.postId,b.postTitle,b.postType,
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

    return user

  }

  /**
   * 내 작성 게시물 조회
   * @param userDto 
   * @returns 게시글번호,게시글제목,게시글타입 orderby 글 작성 최신순
   */
  async getPosts(infoDto: InfoDto) {
    console.log(`게시물`);
    const user = await this.prisma.posts.findMany({
      where:{
        post_userId:Number(infoDto.userId)
      },
      select:{
        postId:true,
        postTitle:true,
        postType:true,
      },
      orderBy:{
        createdAt:'desc'
      }
    })

    return user
  }

}
