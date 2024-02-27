import { Module } from '@nestjs/common';
import { ElasticsearchModule, ElasticsearchService } from '@nestjs/elasticsearch';
import { SearchService } from './search.service';
import { PrismaModule } from '../../../database/prisma/prisma.module';
import { PrismaService } from 'src/database/prisma/prisma.service';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: () => ({
        node: 'http://localhost:9200',
        maxRetries: 10,
        requestTimeout: 60000,
        pingTimeout: 60000,
        sniffOnStart: true,
      }),
    }),
    PrismaModule,
  ],
  providers: [SearchService, PrismaService],
  exports: [SearchService],
})
export class SearchModule {}
