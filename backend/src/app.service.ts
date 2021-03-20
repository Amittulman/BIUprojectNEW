import { Injectable } from '@nestjs/common';
import { AppDal } from './app.dal';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from "./Dto's/createUser.dto";
import { ToDoList } from "./interfaces/todo.interface";
import { CreateToDoListDto } from "./Dto's/createToDoList.dto";
import { CreateTaskDto } from "./Dto's/createTask.sto";

@Injectable()
export class AppService {
  constructor(private readonly appDal: AppDal) {}

  async getHello(): Promise<string> {
    return this.appDal.getHello();
  }

  async getUser(): Promise<User> {
    return this.appDal.getUser();
  }

  async postUser(createUserDto: CreateUserDto): Promise<string> {
    return this.appDal.postUser(createUserDto);
  }

  async deleteUser(id: string): Promise<string> {
    return this.appDal.deleteUser(id);
  }

  async GetToDoList(): Promise<ToDoList> {
    return this.appDal.GetToDoList();
  }

  async postToDoList(createToDoListDto: CreateToDoListDto): Promise<string> {
    return this.appDal.postToDoList(createToDoListDto);
  }

  async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
    return this.appDal.postTaskForToDoList(createTaskDto);
  }
}
