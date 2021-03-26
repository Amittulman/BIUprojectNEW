import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDal } from './app.dal';
import {connectionFactory} from "./connectionFactory";

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, AppDal, connectionFactory],
})
export class AppModule {}
