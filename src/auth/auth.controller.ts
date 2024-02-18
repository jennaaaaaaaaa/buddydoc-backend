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
  Redirect,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { KakaoAuthGuard, NaverAuthGuard } from './oauth/auth.guard';
import { GoogleAuthGuard } from './oauth/auth.guard';

@ApiTags('login')
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * 사용자 인증 후 회원 체크
   * @param res 
   * @param req 
   * @param user 
   */
  private async checkUser(res: Response, req: Request, user: any) {
    try {
      const checkUser = await this.authService.findUser(user);
      
      delete user.password

      res.cookie(process.env.COOKIE_NAME,user, {
        maxAge: 900000,
        httpOnly:true
      })

      if (checkUser) {
        res.redirect('/login');
      } else {
        res.redirect('/signup');
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * 구글 로그인
   * @param res
   * @param req
   */
  @ApiOperation({
    summary: '구글 로그인',
    description: '구글 사용자 인증',
  })
  @UseGuards(GoogleAuthGuard)
  @Get('/oauth/callback/google')
  async googlaCallback(@Res() res: Response, @Req() req: Request) {
    return this.checkUser(res, req, req.user);
  }

  /**
   * 카카오 로그인
   * @param res
   * @param req
   */
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 사용자 인증',
  })
  @UseGuards(KakaoAuthGuard)
  @Get('/oauth/callback/kakao')
  async kakaoCallback(@Res() res: Response, @Req() req: Request) {
    return this.checkUser(res, req, req.user);
  }

  /**
   * 네이버 로그인
   * @param res
   * @param req
   */
  @ApiOperation({
    summary: '네이버 로그인',
    description: '네이버 사용자 인증',
  })
  @UseGuards(NaverAuthGuard)
  @Get('/oauth/callback/naver')
  async naverCallback(@Res() res: Response, @Req() req: Request) {
    return this.checkUser(res, req, req.user);
  }

  @Get('/signup')
  signUp(@Res() res: Response, @Req() req: Request) {
    let test = req.cookies[process.env.COOKIE_NAME]
    console.log('쿠키확인 ',test)
    res.status(200).json({ message: '회원가입 form' });
  }

  
  @Get('/login')
  async login(@Res() res: Response, @Req() req: Request) {
    let test = req.cookies[process.env.COOKIE_NAME]
    console.log('쿠키확인' , test)
    res.status(200).json({ message: '로그인' });
  }

}
