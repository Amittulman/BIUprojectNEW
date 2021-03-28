import { Module } from '@nestjs/common';
import {TasksController} from "./tasks.controller";
import {TasksService} from "./tasks.service";
import {TasksDal} from "./tasks.dal";
import {connectionFactory} from "../connectionFactory";

@Module({
  imports: [],
  controllers: [TasksController],
  providers: [TasksService, TasksDal, connectionFactory],
})
export class TasksModule {}
