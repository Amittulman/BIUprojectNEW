import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AppDal } from './app.dal';
import {connectionFactory} from "./connectionFactory";
import {TasksModule} from "./tasks/tasks.module";

@Module({
  imports: [TasksModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
