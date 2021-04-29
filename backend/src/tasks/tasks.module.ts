import { Module } from '@nestjs/common';
import {TasksController} from "./tasks.controller";
import {TasksService} from "./tasks.service";
import {TasksDal} from "./tasks.dal";
import {connectionFactory} from "../connectionFactory";
import {SchedulerModule} from "../scheduler/scheduler.module";
import {SchedulerService} from "../scheduler/scheduler.service";

@Module({
  imports: [SchedulerModule],
  controllers: [TasksController],
  providers: [TasksService, TasksDal, connectionFactory, SchedulerService],
})
export class TasksModule {}
