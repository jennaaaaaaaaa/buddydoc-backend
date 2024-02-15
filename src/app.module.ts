import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { postModule } from './modules/posts/posts.module';
import { AppService } from './app.service';
// import { SearchModule } from './modules/search/search.module'; //검색

@Module({
  imports: [postModule], //SearchModule 검색관련
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
