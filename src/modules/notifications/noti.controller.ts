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
import { AlarmGateway } from '../alarm/alarm.gateway';

ApiConsumes('notifications');
@Controller('post')
export class NotiContoller {
  constructor(
    private readonly notiService: NotiService,
    private readonly alarmGateway: AlarmGateway
  ) {}
  @UseGuards(JwtAuthGuard)
  @Post(':post/noti')
  async createNotification(@Body() notiDto: NotiDto, @Res() res: Response, @Req() req: Request) {
    try {
      const postId = Number(req.params['post']);
      console.log(req.user['id']);
      notiDto.noti_userId = req.user['id'];
      notiDto.postId = postId;
      //게시글 작성자 확인
      notiDto.userId = await this.notiService.getUserIdatPost(postId);
      console.log(notiDto);
      //신청 보내기
      //await this.notiService.sendNotification(notiDto);
      
      //실시간 알림 보내기
      this.alarmGateway.sendNotification(notiDto.noti_message , notiDto.userId);
      return res.status(200).json({ message: '신청완료' });
    } catch (error) {
      throw new BadRequestException('신청에러');
    }
  }
}
