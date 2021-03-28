import { Injectable } from '@nestjs/common';
import {Task} from "../interfaces/task.interface";
import {User} from "../interfaces/user.interface";
import {ToDoList} from "../interfaces/todo.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateTaskDto} from "../Dto's/createTask.sto";
import {TasksDal} from "./tasks.dal";

@Injectable()
export class TasksService {
  constructor(private readonly tasksDal: TasksDal) {}

  async getHello(): Promise<string> {
    return this.tasksDal.getHello();
  }

  async postTask(task: Task): Promise<void> {
    return this.tasksDal.postTask(task);
  }

  async getUser(): Promise<User> {
    return this.tasksDal.getUser();
  }

  async postUser(user: User): Promise<string> {
    return this.tasksDal.postUser(user);
  }

  async deleteUser(id: string): Promise<string> {
    return this.tasksDal.deleteUser(id);
  }

  async GetToDoList(): Promise<ToDoList> {
    return this.tasksDal.GetToDoList();
  }

  async postToDoList(createToDoListDto: CreateToDoListDto): Promise<string> {
    return this.tasksDal.postToDoList(createToDoListDto);
  }

  async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
    return this.tasksDal.postTaskForToDoList(createTaskDto);
  }
}