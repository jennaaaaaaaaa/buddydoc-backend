import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma/prisma.service';
import { BcryptService } from '../utils/bcrypt/bcrypt.service'

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService,
    private bcryptService: BcryptService) {}

  /**
   * 회원가입 체크
   * @param loginUser
   * @returns 
   */
  async findUser(loginUser: any) {

    const user = await this.prisma.users.findFirst({
      where: {
        email: loginUser.email,
        platform: loginUser.provider,
      },
      select: {
        password:true
      },
    });

    
    return this.bcryptService.comparePasswords(loginUser.password,user.password)
  }
}
