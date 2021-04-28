import { Injectable } from '@nestjs/common';
import { AppDal } from './app.dal';
import { User } from './interfaces/user.interface';
import { ToDoList } from "./interfaces/todo.interface";
import { CreateToDoListDto } from "./Dto's/createToDoList.dto";
import { CreateTaskDto } from "./Dto\'s/createTask.dto";
import {Task} from "./interfaces/task.interface";

@Injectable()
export class AppService {
  constructor(private readonly appDal: AppDal) {}

  async getHello(): Promise<string> {
    return this.appDal.getHello();
  }

  async postTask(task: Task): Promise<void> {
    return this.appDal.postTask(task);
  }

  async getUser(): Promise<User> {
    return this.appDal.getUser();
  }

  async postUser(user: User): Promise<string> {
    return this.appDal.postUser(user);
  }

  async deleteUser(id: string): Promise<string> {
    console.log('deletion user id in  src/app.services', id);

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