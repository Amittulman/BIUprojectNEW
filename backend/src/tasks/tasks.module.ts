import { Module } from '@nestjs/common';
import {TasksController} from "./tasks.controller";
import {TasksService} from "./tasks.service";
import {TasksDal} from "./tasks.dal";
import {connectionFactory} from "../connectionFactory";
import {ScedualerModule} from "../scedualer/scedualer.module";
import {ScedualerService} from "../scedualer/scedualer.service";

@Module({
  imports: [ScedualerModule],
  controllers: [TasksController],
  providers: [TasksService, TasksDal, connectionFactory, ScedualerService],
})
export class TasksModule {}
