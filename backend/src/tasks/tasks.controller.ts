import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto's/createTask.sto";
import {User} from "../interfaces/user.interface";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('GetHello')
  async getHello(): Promise<string> {
    return this.tasksService.getHello();
  }

  @Post('TaskForToDoList')
  postTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.postTask(createTaskDto); //TODO check DTO enforce
  }

  @Get('GetUser')
  async getUser(): Promise<User> {
    return this.tasksService.getUser();
  }

  @Post('PostUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.tasksService.postUser(createUserDto);
  }

  @Delete('DeleteUser')
  async remove(@Param('id') id: string) {
    return await this.tasksService.deleteUser(id);
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


  // TODO endpoints:
  //2. UpdateUser
  //3 deleteUser
  //5 add Task
  //7 delete task
  //8 delete tasks?
  //9 .
}
