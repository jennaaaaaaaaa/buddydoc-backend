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
  import { ApiTags, ApiOperation } from '@nestjs/swagger';
  import { JwtAuthGuard } from 'src/auth/oauth/auth.guard';

  @ApiTags('alarm')
  @Controller()
  export class AlarmController {
    constructor() {}
  
  }
  