import {
  Controller,
  Header,
  Post,
  Param,
  Query,
  Get,
  Put,
  Body,
  Res,
  Req,
  HttpStatus,
  BadRequestException,
  HttpException,
  Next,
  UseGuards,
} from '@nestjs/common';
import { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { KakaoAuthGuard } from './oauth/auth.guard';
import { KakaoStrategy } from './oauth/kakao-strategy';



interface IOAuthUser {
  user: {
    nickname: string;
    email: string;
    password: string;
    accessToken : string;
    refreshToken: string;
  };
}

@ApiTags('login')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @UseGuards(KakaoAuthGuard)
  @Get('/login/callback')
  async kakaoGet(@Res({ passthrough: true }) res: Response, @Req() req:Request & IOAuthUser):Promise<void> {
    
    console.log(`email > ` , req.user.email)
    console.log(`nickname > ` , req.user.nickname)
    console.log(`accessTokken > ` , req.user.accessToken)
    console.log(`refreshToken > ` , req.user.refreshToken)
    
    //res.redirect('/login')
  }

  @Get('/login')
  test(@Res() res: Response, @Req() req : Request){
    
    res.status(200).json({message : '로그인페이지'})
  }

  @Get('/logout')
  KakaoLogout(@Res() res: Response, @Req() req : Request){
    console.log(`로그아웃`)
    
    res.status(200).json({message : '로그아웃 페이지'})
  }
  
}
