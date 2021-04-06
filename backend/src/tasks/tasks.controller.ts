import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto's/createTask.sto";
import {User} from "../interfaces/user.interface";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {AppService} from "../app.service";
import {ScedualerService} from "../scedualer/scedualer.service";

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
    this.schedulerService.tryCalc();
  }

  @Post('TaskForToDoList')
  postTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.postTask(createTaskDto); //TODO check DTO enforce
  }


  @Get('GetToDoList')
  async getToDoList(): Promise<ToDoList> {
    return this.tasksService.GetToDoList();
  }

  @Post('PostToDoList')
  createToDoList(@Body() createToDoListDto: CreateToDoListDto) {
    return this.tasksService.postToDoList(createToDoListDto);
  }

  @Post('TaskForToDoList')
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.postTaskForToDoList(createTaskDto);
  }

}
