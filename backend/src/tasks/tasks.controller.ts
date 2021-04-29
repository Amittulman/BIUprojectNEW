import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {User} from "../interfaces/user.interface";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {Schedule} from "../interfaces/schedule.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {AppService} from "../app.service";
import {ScedualerService} from "../scedualer/scedualer.service";
import {CreateScheduleDto} from "../Dto's/createSchedule.dto";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService, private readonly schedulerService: ScedualerService) {
  }

  @Get('GetHello')
  async getHello(): Promise<string> {
    return this.tasksService.getHello();
  }

  @Get('GetTry')
  async getTry(): Promise<void> {
    //this.schedulerService.tryCalc([]);
  }

  @Post('TaskForToDoList/:createTaskDto')
  postTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.postTask(createTaskDto); //TODO check DTO enforce
  }

  @Get('trig/:id')
  async trig(@Param('id') user_id: string): Promise<void> {
    const tdl = await this.tasksService.GetToDoList(user_id);
    //const categorySlots = await  this. tasksService.getCategorySlots(user_id);
    const categorySlots = [1,1,1,1];
    const res = await this.schedulerService.tryCalc(tdl,categorySlots);
    //change slots to scheduledTask
    //post slots to DB
    console.log(res);
  }

  @Get('GetToDoList/:id')
  async getToDoList(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.GetToDoList(user_id);
  }

  @Post('PostToDoList/:createToDoListDto')
  createToDoList(@Body() createToDoListDto: CreateToDoListDto) {
    return this.tasksService.postToDoList(createToDoListDto);
  }

  // @Post('TaskForToDoList/:createTaskDto')
  // createTask(@Body() createTaskDto: CreateTaskDto) {
  //   return this.tasksService.postTaskForToDoList(createTaskDto);
  // }


  // Scheduled tasks:
  @Get('GetSchedule/:id')
  async getSchedule(@Param('id') user_id: string): Promise<Schedule> {
    return this.tasksService.getSchedule(user_id);
  }

  @Get('GetScheduleTask/:id/:slot')
  async getScheduleTask(@Param('id') user_id: string, @Param('slot') slot_id:string): Promise<ScheduledTask> {
    return this.tasksService.getScheduleTask(user_id,slot_id);
  }

  @Post('PostSchedule/')
  postSchedule(@Body() createScheduleDto: CreateScheduleDto) {
    return this.tasksService.postSchedule(createScheduleDto);
  }
  @Post('UpdateSchedule/:id/:slot')
  updateScheduleSlot(@Body() slot: CreateScheduledTaskDto) {
    console.log(slot)
    return this.tasksService.updateScheduleSlot(slot);
  }





  // TODO endpoints:
  //2. UpdateUser
  //3 deleteUser
  //5 add Task
  //7 delete task
  //8 delete tasks?
  //9 .
}
