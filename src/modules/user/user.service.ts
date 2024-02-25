import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { UserDto } from './dto/user.dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  /**
   * 회원 생성
   * @param usersDto
   * @returns prisma create 결과
   */
  async createUser(userDto: UserDto) {
    try {
      const { email, userName, userNickname, position, gitURL, userStatus, introduction, career, password, platform } =
        userDto;
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
   * 회원 정보 수정
   * @param usersDto
   * @returns
   */
  async updateUser(userDto: UserDto) {
    try {
      const { userName, userNickname, position, gitURL, userStatus, introduction, career } = userDto;

      const updateResult = await this.prisma.users.update({
        where: {
          userId: userDto.userId,
        },
        data: {
          userName: userName,
          userNickname: userNickname,
          position: position,
          gitURL: gitURL,
          userStatus: userStatus,
          introduction: introduction,
          career: career,
          createdAt: new Date(),
        },
      });

      return updateResult;
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

  /**
   * 기술 스택 수정
   * @param userId
   * @param userSkills
   * @returns
   */
  async updateSkills(userId: number, userSkills: string[]) {
    try {
      const skillObj = userSkills.map((skill) => ({
        userId: userId,
        skill: skill.trim(),
      }));

      for (const skill of skillObj) {
        await this.prisma.skills.upsert({
          where: { userId: skill.userId, userId_skill: skill },
          update: { skill: skill.skill },
          create: { userId: skill.userId, skill: skill.skill, createdAt: new Date() },
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}
