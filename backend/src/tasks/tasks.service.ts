import { Injectable } from '@nestjs/common';
import {Task} from "../interfaces/task.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {ToDoList} from "../interfaces/todo.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateScheduledTaskDto} from "../Dto\'s/createScheduledTask.dto";
import {TasksDal} from "./tasks.dal";
import {CreateTaskDto} from "../Dto's/createTask.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";

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

  async getTasks(user_id): Promise<ToDoList> {
    return this.tasksDal.getTasks(user_id);
  }

  async postTasks(tasks: Array<CreateTaskDto>): Promise<string> {
    return this.tasksDal.postTasks(tasks);
  }
  async updateTasks(tasks: Array<CreateTaskDto>): Promise<any> {
    return this.tasksDal.updateTasks(tasks);
  }

  // async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
  //   return this.tasksDal.postTaskForToDoList(createTaskDto);
  // }

  async getSchedule(user_id):Promise<Array<number>>{
    return this.tasksDal.getSchedule(user_id);
  }
  async getScheduleTask(user_id, slot_id):Promise<ScheduledTask>{
    return this.tasksDal.getScheduleTask(user_id, slot_id);
  }

  async postSchedule(createScheduleDto: Array<CreateScheduledTaskDto>): Promise<string>{
    return this.tasksDal.postSchedule(createScheduleDto);
  }
  async postCategories(categories: Array<CreateCategorySlotDto>): Promise<string>{
    return this.tasksDal.postCategories(categories);
  }

  async updateScheduleSlot(createScheduleDto: CreateScheduledTaskDto, slot: number): Promise<string>{
    return this.tasksDal.updateScheduleSlot(createScheduleDto, slot);
  }

  async getUserCategories(user_id):Promise<Array<number>>{
    return this.tasksDal.getUserCategories(user_id);
  }

  async getUserCategorySlots(user_id):Promise<Array<number>>{
    return this.tasksDal.getUserCategorySlots(user_id);
  }

  async deleteSchedule(user_id):Promise<string>{
    return this.tasksDal.deleteSchedule(user_id);
  }

  async deleteUserCategories(user_id):Promise<string>{
    return this.tasksDal.deleteUserCategories(user_id);
  }

  async deleteTasks(user_id: string, task_ids: Array<number>):Promise<string>{
    return this.tasksDal.deleteTasks(user_id, task_ids);
  }
}