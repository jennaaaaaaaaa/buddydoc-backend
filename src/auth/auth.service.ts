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
      console.log(`loginUser >> `, loginUser);
      // const user = await this.prisma.users.findFirst({
      //   where: {
      //     email: loginUser.email,
      //     platform: loginUser.provider,
      //   },
      //   select: {
      //     userId: true,
      //     userNickname: true,
      //     email: true,
      //     password: true,
      //     platform: true,
      //   },
      // });

      const user = await this.prisma.$queryRaw`
      select userId,userNickname,email,password,platform from users
      where email=${loginUser.email} and platform=${loginUser.platform}`;

      console.log('after prisma user >> ', user);

      //유저 가입이 안되어 있을때
      if (user[0]?.length == 0) {
        //비밀번호 암호화
        loginUser.password = await this.bcryptService.hashPassword(loginUser.password);
        //사용자 가입처리
        await this.userService.createUser(loginUser);
      } else {
        //가입은 되어 있지만 회원정보가 없을때
        if (user[0]?.userNickname === null) return null;
        //비밀번호가 맞는지 체크
        const passwordCheck = await this.bcryptService.comparePasswords(String(loginUser.password), user[0]?.password);
        if (!passwordCheck) throw new ForbiddenException('비밀번호 불일치');

        //비밀번호 정보 삭제
        delete user[0]?.password;

        return user[0];
      }

      return null;
    } catch (error) {
      console.log(error);
    }
  }

  async checkToken(){
    
  }
  // async validateUser(payload: any): Promise<any> {
  //   console.log(`받은 토큰 >> `, payload);
  //   const token = this.jwtService.verify(payload);
  //   console.log(`복호화 토큰`, token);
  //   const user = await this.prisma.users.findFirst({
  //     where: {
  //       email: payload.email,
  //       platform: payload.platform,
  //       userNickname:payload.userNickname
  //     },
  //     select: {
  //       userId: true,
  //     },
  //   });
  //   console.log(`유저 검증 ` , user)

  //   // 여기서 사용자를 데이터베이스에서 조회하고 유효성을 검사하는 로직을 작성합니다.
  //   // payload는 토큰에서 추출된 정보입니다. 필요에 따라 사용자를 식별하고 조회할 수 있습니다.
  //   // 사용자를 찾았다면 해당 사용자를 반환하고, 사용자를 찾지 못했다면 null을 반환합니다.
  //   return user;
  // }

  async login(user: any) {
    const payloadUser = { id: user.userId };

    const payload = this.jwtService.sign(payloadUser);
    console.log(payload);
    return payload;
  }
}
