import {Inject, Injectable} from '@nestjs/common';

import knex, {Knex} from "knex";
import {OUR_DB} from "../constants";
import {User} from "../interfaces/user.interface";
import {ToDoList} from "../interfaces/todo.interface";
import {Task} from "../interfaces/task.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {Schedule} from "../interfaces/schedule.interface";
import {CreateScheduleDto} from "../Dto's/createSchedule.dto";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";

const TASK_TABLE = 'tasks_table';
const SCHEDULE_TABLE = 'scheduled_tasks';
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
      task_id: task.task_id,
      user_id: task.user_id,
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
    let suc = 'Success';
    try{

      const res = await  this.db(TASK_TABLE).insert(createToDoListDto);
    }
    catch (e){
      suc = e
    }
    return suc;  }
  //
  // async postTaskForToDoList(createTaskDto: CreateTaskDto): Promise<string> {
  //   console.log(createTaskDto);
  //   let suc = 'Success';
  //   try{
  //
  //     const res = await  this.db(TASK_TABLE).insert(createTaskDto);
  //   }
  //   catch (e){
  //     suc = e
  //   }
  //   return suc;
  // }

  //Schedule
  async getSchedule(user_id: string): Promise<Schedule> {
    const dataArr = [];
    // console.log('param raw: ', user_id);
    // console.log('param parsed: ', parseInt(user_id));

    const res = await this.db.from(SCHEDULE_TABLE).select('*').where('user_id',parseInt(user_id));
    // console.log(JSON.stringify(res))
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return  { slots: dataArr };
  }
  async getScheduleTask(user_id: string, slot_id:string): Promise<ScheduledTask> {
    const dataArr = [];
    let varia:ScheduledTask;
    // console.log('param raw: ', user_id);
    // console.log('param parsed: ', parseInt(user_id));

    const res = this.db(SCHEDULE_TABLE).select('*').where({'user_id': parseInt(user_id), 'slot_id': parseInt(slot_id)});
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return res;
  }

  async postSchedule(schedule: CreateScheduleDto){
    let suc = 'Success';
    try{

    const res = await  this.db(SCHEDULE_TABLE).insert(schedule);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async updateScheduleSlot(schedule: CreateScheduledTaskDto){
    let suc = 'Success';
    try{
      // console.log(schedule);
      // console.log("tryting to update user "+user_id+" slot "+slot_id+"with the next: "+schedule.taskID);
      const res = await  this.db(SCHEDULE_TABLE).where({'user_id': schedule.userId, 'slot_id': schedule.slotID}).update('task_id',schedule.taskID);
    }
    catch (e){
      suc = e
    }
    return suc;
  }
}
