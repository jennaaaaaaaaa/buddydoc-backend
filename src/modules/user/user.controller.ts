import { Controller, Post, Param, Get, Put, Body, Res, Req, HttpStatus, BadRequestException, HttpException,Next } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InfoDto } from './dto/info.dto';

@ApiTags('signup')
@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  /**
   * 회원가입
   * @param userDto
   * @param res
   * @returns
   */
  @ApiOperation({
    summary: '회원가입 API',
    description: '회원가입 + skill 등록',
  })
  @Post('/signup')
  async create(@Body() userDto: UserDto, @Res() res: Response) {
    try {
      //회원생성
      let user = await this.userService.createUser(userDto);

      //회원생성 실패시 에러처리 필요

      //skills에 skill 추가
      await this.userService.insertSkills(user.userId, userDto.skills);

    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }

    return res.status(201).json({ message: '회원가입 완료' });
  }

  /**
   * 내 정보/북마크/스터디/게시물 조회
   * @param userDto 
   * @returns 
   */
  @ApiOperation({
    summary: '내 정보/북마크/스터디/게시물 조회 API',
    description: '내 정보, 관심게시물, 참여스터디, 작성게시물 조회 API입니다.',
  })
  @Get('/user/my-info')
  async getUserInfo(@Body() infoDto: InfoDto) {
    try {
      
      if (!infoDto.userId) throw new HttpException('로그인이 필요한 서비스 입니다',HttpStatus.BAD_REQUEST)
      console.log(infoDto);

      const methodMap = {
        bookmarks : 'getBookmarks',
        studylists : 'getStudylists',
        posts : 'getPosts'
      }

      const methodName = methodMap[infoDto.name] || 'getUserInfo'

      const result = await this.userService[methodName](infoDto)
     
      console.log('결과값 > ', result)
      return result;
      
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  
}
