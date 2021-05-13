import {Inject, Injectable} from '@nestjs/common';
import {User} from './interfaces/user.interface';
import {CreateUserDto} from "./Dto's/createUser.dto";
import {Task} from "./interfaces/task.interface";
import {ToDoList} from "./interfaces/todo.interface";
import {CreateToDoListDto} from "./Dto's/createToDoList.dto";
import {CreateTaskDto} from "./Dto\'s/createTask.dto";
import {connectDataBase} from "./connectDataBase";
import knex, {Knex} from "knex";
import {OUR_DB} from "./constants";

const TASK_TABLE = 'tasks_table';
@Injectable()
export class AppDal {

  constructor(@Inject(OUR_DB) private db:Knex) {
  }

  // TODO: add access to DB late
  //DAL - data access layer
  async getHello(): Promise<string> {
    const res = await this.db.from(TASK_TABLE).select();
    console.log('!!!!!!!!! res: ', JSON.stringify(res));
    //return res[0][0].result === '2';
    return JSON.stringify(res);
  }

  async postTask(task: Task): Promise<void> {
    console.log(task);
    await this.db(TASK_TABLE).insert({
      task_id: task.task_id,
      user_id: task.user_id,
      task_title: task.task_title,
      duration: task.duration,
      priority: task.priority,
      category_id: task.category_id,
      //constraints: task.constraints
    });
  }

  async getUser(): Promise<User> {
    return { username: 'Amitush', id: 123 };
  }

  async postUser(user: User): Promise<string> {
    //console.log(user);
    return "post user";
  }

  async deleteUser(id: string): Promise<string> {
    console.log('user id in services dal for deletion: ', id);

    return `This action removes a #${id} user`;
  }

  async GetToDoList(): Promise<ToDoList> {
    const temp_task :Task  = {
      task_id: 10,
      user_id: 11,
      task_title: 'first task',
      duration: 40,
      priority: 2,
      category_id: 3,
      constraints: null,
      recurrings: 1

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
