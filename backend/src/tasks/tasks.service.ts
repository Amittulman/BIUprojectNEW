import { Injectable } from '@nestjs/common';
import {Task} from "../interfaces/task.interface";
import {Schedule} from "../interfaces/schedule.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {ToDoList} from "../interfaces/todo.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {CreateScheduleDto} from "../Dto\'s/createSchedule.dto";
import {CreateScheduledTaskDto} from "../Dto\'s/createScheduledTask.dto";
import {TasksDal} from "./tasks.dal";
import {CategorySlot} from "../interfaces/categorySlot.interface";

@Injectable()
export class TasksService {
  constructor(private readonly tasksDal: TasksDal) {}

  async getHello(): Promise<string> {
    return this.tasksDal.getHello();
  }

  async postTask(task: Task): Promise<void> {
    return this.tasksDal.postTask(task);
  }

  async GetToDoList(user_id): Promise<ToDoList> {
    return this.tasksDal.GetToDoList(user_id);
  }

  async postToDoList(createToDoListDto: CreateToDoListDto): Promise<string> {
    return this.tasksDal.postToDoList(createToDoListDto);
  }

  // async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
  //   return this.tasksDal.postTaskForToDoList(createTaskDto);
  // }

  async getSchedule(user_id):Promise<Schedule>{
    return this.tasksDal.getSchedule(user_id);
  }
  async getScheduleTask(user_id, slot_id):Promise<ScheduledTask>{
    return this.tasksDal.getScheduleTask(user_id, slot_id);
  }

  async postSchedule(createScheduleDto: CreateScheduleDto): Promise<string>{
    return this.tasksDal.postSchedule(createScheduleDto);
  }

  async updateScheduleSlot(createScheduleDto: CreateScheduledTaskDto): Promise<string>{
    return this.tasksDal.updateScheduleSlot(createScheduleDto);
  }

  async getUserCategories(user_id):Promise<Array<number>>{
    return this.tasksDal.getUserCategories(user_id);
  }

  async getUserCategorySlots(user_id):Promise<Array<CreateScheduledTaskDto>>{
    return this.tasksDal.getUserCategorySlots(user_id);
  }
}