import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class BcryptService {
  async hashPassword(password: string): Promise<string> {
    const hashedPassword = await bcrypt.hash(password, 10);
    return hashedPassword;
  }

  async comparePasswords(plainPassword: string, hashedPassword: string): Promise<boolean> {
    //console.log(`bcrypt 비밀번호 비교 > ${plainPassword} <> ${hashedPassword}`)
    const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
    return isMatch;
  }
}
