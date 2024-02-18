import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) {}

  /**
   * 회원가입 체크
   * @param loginUser
   * @returns 
   */
  async findUser(loginUser: any) {

    const user = await this.prisma.users.findFirst({
      where: {
        email: loginUser.email,
        password: loginUser.password,
        platform: loginUser.provider,
      },
      select: {
        userId: true,
      },
    });
    return user
  }
}
