import { HttpException, Injectable, NotFoundException, Req, Res } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { AuthService } from '../auth.service';

export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      // jwtFromRequest: ExtractJwt.fromExtractors([
      //   (request) => {
      //     console.log(`쿠키> `, request.cookies.authCookie);
      //     return request?.cookies?.authCookie;
      //   },
      //]),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET_KEY,
      ignoreExpiration: false,
    });
  }

  async validate(payload: any) {
    console.log('payload > ', payload);
    const loginUser = {
      id: payload.id,
      nickname: payload.nickname,
    };

    return loginUser;
  }
}
