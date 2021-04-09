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

  async GetToDoList(user_id): Promise<ToDoList> {
    return this.tasksDal.GetToDoList(user_id);
  }

  async postToDoList(createToDoListDto: CreateToDoListDto): Promise<string> {
    return this.tasksDal.postToDoList(createToDoListDto);
  }

  async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
    return this.tasksDal.postTaskForToDoList(createTaskDto);
  }
}