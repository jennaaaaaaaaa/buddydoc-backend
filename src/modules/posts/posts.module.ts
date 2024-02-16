import { Module } from '@nestjs/common';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { S3Module } from 'src/providers/aws/s3/s3.module';

@Module({
  controllers: [PostController],
  providers: [PostService, S3Module],
  imports: [PrismaModule, S3Module],
})
export class postModule {}
