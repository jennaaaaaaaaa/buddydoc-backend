import { Module } from '@nestjs/common';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';
import { PrismaModule } from '../../database/prisma/prisma.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [PrismaModule],
})
export class postModule {}
