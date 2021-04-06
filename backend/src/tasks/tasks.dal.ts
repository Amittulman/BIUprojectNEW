import {Inject, Injectable} from '@nestjs/common';

import knex, {Knex} from "knex";
import {OUR_DB} from "../constants";
import {User} from "../interfaces/user.interface";
import {ToDoList} from "../interfaces/todo.interface";
import {Task} from "../interfaces/task.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateTaskDto} from "../Dto's/createTask.sto";

const TASK_TABLE = 'tasks_table';
@Injectable()
export class TasksDal {

  constructor(@Inject(OUR_DB) private db:Knex) {
  }

  // TODO: add access to DB late
  //DAL - data access layer
  async getHello(): Promise<string> {
    const res = await this.db.from(TASK_TABLE).select();
    console.log('!!!!!!!!! res: ', JSON.stringify(res));
    //return res[0][0].result === '2';
    return 'Hi!';
  }

  async postTask(task: Task): Promise<void> {
    console.log(task);
    await this.db(TASK_TABLE).insert({
      task_id: task.taskID,
      user_id: task.userId,
      task_title: task.title,
      duration: task.duration,
      priority: task.priority,
      category_id: task.categoryID,
      //constraints: task.constraints
    });
  }

  async GetToDoList(): Promise<ToDoList> {
    const temp_task :Task  = {
      taskID: 10,
      userId: 11,
      title: 'first task',
      duration: 40,
      priority: 2,
      categoryID: 3,
      constraints: 'nothing'
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
