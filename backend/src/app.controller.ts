import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import { AppService } from './app.service';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from "./Dto's/createUser.dto";
import { ToDoList } from "./interfaces/todo.interface";
import { CreateToDoListDto } from "./Dto's/createToDoList.dto";
import { CreateTaskDto } from "./Dto's/createTask.sto";


@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('GetHello')
  async getHello(): Promise<string> {
    return this.appService.getHello();
  }

  @Post('TaskForToDoList')
  postTask(@Body() createTaskDto: CreateTaskDto) {
    return this.appService.postTask(createTaskDto); //TODO check DTO enforce
  }

  @Get('GetUser')
  async getUser(): Promise<User> {
    return this.appService.getUser();
  }

  @Post('PostUser')
  createUser(@Body() createUserDto: CreateUserDto) {
    return this.appService.postUser(createUserDto);
  }

  @Delete('DeleteUser')
  async remove(@Param('id') id: string) {
    return await this.appService.deleteUser(id);
  }

  @Get('GetToDoList')
  async getToDoList(): Promise<ToDoList> {
    return this.appService.GetToDoList();
  }

  @Post('PostToDoList')
  createToDoList(@Body() createToDoListDto: CreateToDoListDto) {
    return this.appService.postToDoList(createToDoListDto);
  }

  @Post('TaskForToDoList')
  createTask(@Body() createTaskDto: CreateTaskDto) {
    return this.appService.postTaskForToDoList(createTaskDto);
  }


  // TODO endpoints:
  //2. UpdateUser
  //3 deleteUser
  //5 add Task
  //7 delete task
  //8 delete tasks?
  //9 .
}
