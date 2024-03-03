import { Module } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { PrismaModule } from '../../../database/prisma/prisma.module';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        cloud: {
          id: process.env.ELASTIC_CLOUD_ID,
        },
        auth: {
          username: process.env.ELASTIC_USERNAME,
          password: process.env.ELASTIC_PASSWORD,
        },
        maxRetries: 10,
      }),
    }),
    PrismaModule,
  ],
  providers: [SearchService, PrismaService],
  exports: [SearchService],
})
export class SearchModule {}
