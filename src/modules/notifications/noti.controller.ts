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
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { HttpExceptionFilter } from 'src/common/http-exception.filter';
import { JwtAuthGuard } from 'src/auth/oauth/auth.guard';
import { NotiService } from './noti.service';
import { NotiDto } from './dto/noti.dto';

ApiConsumes('notifications');
@Controller('post')
export class NotiContoller {
  constructor(private readonly notiService: NotiService) {}

  @UseGuards(JwtAuthGuard)
  @Post(':post/noti')
  async createNotification(@Res() res: Response, @Req() req: Request, notiDto: NotiDto) {
    try {
      const postId = Number(req.params);

      notiDto.noti_userId = req.user['id'];
      notiDto.noti_message = req.body.noti_message;
      notiDto.userId = await this.notiService.getUserIdatPost(postId);

      await this.notiService.sendNotification(notiDto);
      return res.status(200).json({ message: '신청완료' });
    } catch (error) {}
  }
}
