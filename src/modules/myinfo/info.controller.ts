import { Controller, Post, Param, Get, Put, Body, Res, Req, HttpStatus, BadRequestException, HttpException,Next } from '@nestjs/common';
import { Response } from 'express';
import {InfoService } from './info.service'

import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InfoDto } from '../myinfo/dto/info.dto';

@ApiTags('user/my-info')
@Controller('user')
export class InfoController {
  constructor(private readonly InfoService: InfoService) {}

  /**
   * 내 정보/북마크/스터디/게시물 조회
   * @param userDto 
   * @returns 
   */
  @ApiOperation({
    summary: '내 정보/북마크/스터디/게시물 조회 API',
    description: '내 정보, 관심게시물, 참여스터디, 작성게시물 조회 API입니다.',
  })
  @Get('/my-info')
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

      const result = await this.InfoService[methodName](infoDto)
     
      console.log('결과값 > ', result)
      return result;
      
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  
}
