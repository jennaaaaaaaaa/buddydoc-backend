import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

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
      const { email, userName, userNickname, position, gitURL, userStatus, introduction, career, password, platform } =
        usersDto;

      //dto 값을 entity 값으로 매핑 후 데이터에 넣어야하는가?
      // or 데이터 에 넣은값을 entitiy에 매핑후 핸들링 해야 하는가?
      const user = await this.prisma.users.create({
        data: {
          email,
          userName,
          userNickname,
          position,
          gitURL,
          userStatus: userStatus,
          introduction,
          career: Number(career),
          createdAt: new Date(),
          password,
          platform,
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
  async insertSkills(userId: number, userSkills: string[]) {
    try {
      const skillObj = userSkills.map((skill) => ({
        userId: userId,
        skill: skill.trim(),
        createdAt: new Date(),
      }));

      const skill = await this.prisma.skills.createMany({ data: skillObj });

      return skill;
    } catch (error) {
      console.log(error);
    }
  }
}
