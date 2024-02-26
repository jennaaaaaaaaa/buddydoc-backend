import {
  Res,
  Req,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpException,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
  UploadedFile,
  UploadedFiles,
  UseFilters,
  UseInterceptors,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/oauth/auth.guard';
import { NotiService } from './noti.service';
import { NotiDto } from './dto/noti.dto';

ApiConsumes('notifications');
@Controller('post')
export class NotiContoller {
  constructor(private readonly notiService: NotiService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':post/noti')
  async createNotification(@Body() notiDto: NotiDto, @Res() res: Response, @Req() req: Request) {
    try {
      const postId = Number(req.params['post']);
      console.log(req.user['id']);
      notiDto.noti_userId = req.user['id'];
      notiDto.postId=postId
      notiDto.userId = await this.notiService.getUserIdatPost(postId);
      console.log(notiDto);
      await this.notiService.sendNotification(notiDto);
      return res.status(200).json({ message: '신청완료' });
    } catch (error) {
      throw new BadRequestException('신청에러')
    }
  }
}
