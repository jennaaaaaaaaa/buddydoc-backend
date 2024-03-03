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
      console.log('회원가입 ', userDto);
      const {
        email,
        userNickname,
        position,
        gitURL,
        userStatus,
        introduction,
        career,
        password,
        platform,
        profileImage,
      } = userDto;
      const user = await this.prisma.users.create({
        data: {
          email,
          userNickname,
          position,
          profileImage,
          userStatus: userStatus,
          career,
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
      console.log('회원수정 ', userDto);
      const { userId, userNickname, position, profileImage, userStatus, introduction, career,skillList } = userDto;
      console.log(userId, userNickname, position, career,skillList);
      //const updateResult = await this.prisma.$queryRaw`
      //update users set userNickname=${userNickname},position=${position},
      //career=${career} where userId=${userId}`
      const updateResult = await this.prisma.users.update({
        where: {
          userId: userId,
        },
        data: {
          userNickname: userNickname,
          position: position,
          profileImage: profileImage,
          userStatus: userStatus,
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
   * @param skillList
   * @returns prisma create 결과
   */
  async insertSkills(userId: number, skillList: string[]) {
    try {
      const skillObj = skillList.map((skill) => ({
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
   * @param skillList
   * @returns
   */
  async updateSkills(userId: number, skillList: string[]) {
    try {
      const skillObj = skillList.map((skill) => ({
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

  /**
   * 닉네임 중복확인
   * @param userNickname
   * @returns
   */
  async checkId(userNickname: string) {
    try {
      if (userNickname == '') return true;
      const checkId = await this.prisma.users.findFirst({
        where: {
          userNickname: userNickname,
        },
        select: {
          userNickname: true,
        },
      });
      console.log('닉네임 중복 확인 : ', checkId.userNickname);
      return checkId.userNickname;
    } catch (error) {
      console.log(error);
    }
  }
  //임시 닉네임 삭제
  async deleteNickname(userId: number){
    try {
      
      const checkId = await this.prisma.$queryRaw`
      update users set userNickName=null where userId =${userId}`
      
      return checkId
      
    } catch (error) {
      console.log(error);
    }
  }
}
