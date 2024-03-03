import { Injectable, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';


@Injectable()
export class KakaoAuthGuard extends AuthGuard('kakao') {}

@Injectable()
export class GoogleAuthGuard extends AuthGuard('google') {}

@Injectable()
export class NaverAuthGuard extends AuthGuard('naver') {}

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  async canActivate(context: ExecutionContext) {
    try {
      return (await super.canActivate(context)) as boolean;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        return true;
      }
      throw error;
    }
  }

  handleRequest(err, user, info, context) {
    return user;
  }
}
