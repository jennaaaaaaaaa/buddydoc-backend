import { Module } from '@nestjs/common';
import { PostController } from './posts.controller';
import { PostService } from './posts.service';
import { PrismaModule } from '../../database/prisma/prisma.module';
import { S3Module } from 'src/providers/aws/s3/s3.module';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchModule } from './search/search.module';

@Module({
  controllers: [PostController],
  providers: [PostService],
  imports: [PrismaModule, S3Module, SearchModule],
  exports: [PostService],
})
export class PostModule {}
