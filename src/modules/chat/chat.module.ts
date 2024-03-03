import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
// import { PrismaService } from 'src/database/prisma/prisma.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';
import { PostModule } from '../posts/posts.module';
// import { PostService } from '../posts/posts.service';

@Module({
  providers: [ChatService, ChatGateway],
  controllers: [ChatController],
  imports: [PrismaModule, PostModule],
})
export class ChatModule {}
