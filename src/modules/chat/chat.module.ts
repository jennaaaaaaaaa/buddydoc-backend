import { Module } from '@nestjs/common';
// import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
// import { PrismaService } from 'src/database/prisma/prisma.service';
import { PrismaModule } from 'src/database/prisma/prisma.module';

@Module({
  providers: [ChatService], //ChatGateway
  controllers: [ChatController],
  imports: [PrismaModule],
})
export class ChatModule {}
