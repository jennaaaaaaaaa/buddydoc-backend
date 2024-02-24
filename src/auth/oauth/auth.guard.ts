import { Injectable } from '@nestjs/common';
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
export class LocalAuthGuard extends AuthGuard('local') {}
