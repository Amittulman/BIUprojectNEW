import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDal } from './app.dal';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppDal],
})
export class AppModule {}
