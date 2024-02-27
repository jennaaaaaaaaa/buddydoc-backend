import {
  Controller,
  Post,
  Param,
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
import { Response, Request } from 'express';
import { UserService } from './user.service';
import { UserDto } from './dto/user.dto';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/oauth/auth.guard';

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
  @UseGuards(JwtAuthGuard)
  @Post('/signup')
  async create(@Body() userDto: UserDto, @Res() res: Response, @Req() req: Request) {
    try {
      userDto.userId = req.user['id'];
      //회원가입
      const user = await this.userService.updateUser(userDto);

      //회원생성 실패시 에러처리 필요

      // skills에 skill 추가
      await this.userService.insertSkills(user.userId, userDto.skills);

      return res.status(201).json({ message: '회원가입 완료' });
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
