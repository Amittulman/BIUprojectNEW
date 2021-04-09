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
      constraints: task.constraints
    });
  }

  async GetToDoList(user_id: string): Promise<ToDoList> {
    const dataArr = [];
    // console.log('param raw: ', user_id);
    // console.log('param parsed: ', parseInt(user_id));

    const res = await this.db.from(TASK_TABLE).select('*').where('user_id',parseInt(user_id));
    // console.log(JSON.stringify(res))
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return  { tasks: dataArr };
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
