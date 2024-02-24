import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { BcryptService } from '../utils/bcrypt/bcrypt.service';
import { JwtService } from '@nestjs/jwt';
import { UserService } from '../modules/user/user.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private bcryptService: BcryptService,
    private jwtService: JwtService,
    private userService: UserService
  ) {}

  /**
   * 회원가입 체크
   * @param loginUser
   * @returns
   */
  async findUser(loginUser: any) {
    try {
      const user = await this.prisma.users.findFirst({
        where: {
          email: loginUser.email,
          platform: loginUser.provider,
        },
        select: {
          userId: true,
          userNickname: true,
          email: true,
          password: true,
        },
      });

      if (!user) {
        //비밀번호 암호화
        loginUser.password = await this.bcryptService.hashPassword(loginUser.password);
        //사용자 가입처리
        await this.userService.createUser(loginUser);
      } else {
        //비밀번호가 맞는지 체크
        const passwordCheck = await this.bcryptService.comparePasswords(String(loginUser.password), user.password);
        if (!passwordCheck) throw new NotFoundException();

        delete user.password

        return user;
      }

      return null;
    } catch (error) {
      console.log(error);
    }
  }

  
  async login(user: any) {
    console.log(`페이로드 생성`, user)
    const payload = { userId:user.userId , nickname: user.userNickname, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
 
}
