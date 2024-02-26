import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
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
      const user = await this.prisma.users.findMany({
        where: {
          email: loginUser.email,
          platform: loginUser.platform,
        },
        select: {
          userId: true,
          userNickname: true,
          password: true,
        },
      });

      console.log('after prisma user >> ', user);

      //유저 가입이 안되어 있을때
      if (user.length == 0) {
        //비밀번호 암호화
        loginUser.password = await this.bcryptService.hashPassword(loginUser.password);
        //사용자 가입처리
        await this.userService.createUser(loginUser);
      } else {
        //가입은 되어 있지만 회원정보가 없을때
        //비밀번호가 맞는지 체크
        const passwordCheck = await this.bcryptService.comparePasswords(String(loginUser.password), user[0].password);
        if (!passwordCheck) throw new ForbiddenException('비밀번호 불일치');

        //비밀번호 정보 삭제
        delete user[0]?.password;
      }

      return user[0];
    } catch (error) {
      console.log(error);
    }
  }

  async checkToken() {}
  async login(user: any) {
    const payloadUser = { id: user.userId, nickname:user.userNickname };

    const payload = this.jwtService.sign(payloadUser);
    console.log(payload);
    return payload;
  }
}
