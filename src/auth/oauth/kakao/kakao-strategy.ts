import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-kakao';

export class KakaoStrategy extends PassportStrategy(Strategy, 'kakao') {
  constructor() {
    super({
      clientID: process.env.KAKAO_CLIENT_ID,
      clientSecret: process.env.KAKAO_SECRET_KEY,
      callbackURL: process.env.KAKAO_CALLBACK_URL,
      scope: ['account_email', 'profile_nickname','profile_image'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile, done) {
    console.log('카카오 로그인 ', profile);
    const user = {
      email: profile._json.kakao_account.email,
      password: String(profile.id),
      profile_image: profile._json.properties.thumbnail_image,
      nickname: profile.displayName,
      platform:profile.provider,      
    };

    return done(null,user);
  }
}
