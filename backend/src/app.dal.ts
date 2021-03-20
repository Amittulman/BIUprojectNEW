import { Injectable } from '@nestjs/common';
import { User } from './interfaces/user.interface';
import { CreateUserDto } from "./Dto's/createUser.dto";
import { Task } from "./interfaces/task.interface";
import { ToDoList } from "./interfaces/todo.interface";
import { CreateToDoListDto } from "./Dto's/createToDoList.dto";
import { CreateTaskDto } from "./Dto's/createTask.sto";
import {connectDataBase} from "./connectDataBase";

@Injectable()
export class AppDal {
  private db: any; //TODO:knex

  constructor() {
    this.db = connectDataBase.createConnection();
  }


  // TODO: add access to DB late
  //DAL - data access layer
  async getHello(): Promise<string> {
    const res = await this.db.raw('SELECT 1+1 AS result');
    console.log('!!!!!!!!! res: ', JSON.stringify(res));
    //return res[0][0].result === '2';
    return 'Hi!';
  }

  async getUser(): Promise<User> {
    return { username: 'Amitush', id: 123 };
  }

  async postUser(createUserDto: CreateUserDto): Promise<string> {
    console.log(createUserDto);
    return "post user success";
  }

  async deleteUser(id: string): Promise<string> {
    return `This action removes a #${id} user`;
  }

  async GetToDoList(): Promise<ToDoList> {
    const temp_task :Task  = {
      title: "basketball",
      duration: 2,
      date: "1/1/2020",
      time: "16:00",
      priority: 1
    }
    return { tasks: [temp_task] };
  }

  async postToDoList(createToDoListDto: CreateToDoListDto): Promise<string> {
    console.log(createToDoListDto);
    return "post ToDoList success";
  }

  async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
    console.log(createTaskDto);
    return "post TaskForToDoList success";
  }

}
