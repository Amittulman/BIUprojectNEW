import {Inject, Injectable} from '@nestjs/common';

import knex, {Knex} from "knex";
import {OUR_DB} from "../constants";
import {ToDoList} from "../interfaces/todo.interface";
import {Task} from "../interfaces/task.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";
import {CreateTaskDto} from "../Dto's/createTask.dto";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";

const TASK_TABLE = 'tasks_table';
const CATEGORY_SLOT_TABLE = 'category_slots';
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
      task_title: task.task_title,
      duration: task.duration,
      priority: task.priority,
      category_id: task.category_id,
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
  async postTasks(tasks: Array<CreateTaskDto>): Promise<string> {
    console.log(tasks);
    let suc = 'Success';
    try{

      const res = await  this.db(TASK_TABLE).insert(tasks);
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
  //Schedule
  // async getSchedule(user_id: string): Promise<Array<number>> {
  //   const dataArr = [];
  //   // console.log('param raw: ', user_id);
  //   // console.log('param parsed: ', parseInt(user_id));
  //
  //   const res = await this.db.from(SCHEDULE_TABLE).select('task_id').where('user_id',parseInt(user_id));
  //   // console.log(JSON.stringify(res))
  //   res.forEach(function(value) {
  //     dataArr.push(value)
  //   });
  //   return  dataArr;
  // }

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
  async postSchedule(schedule: Array<CreateScheduledTaskDto>){
    let suc = 'Success';
    try{

    const res = await  this.db(SCHEDULE_TABLE).insert(schedule);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async postCategories(categories: Array<CreateCategorySlotDto>){
    let suc = 'Success';
    try{

    const res = await  this.db(CATEGORY_SLOT_TABLE).insert(categories);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async updateScheduleSlot(schedule: CreateScheduledTaskDto, slot: number){
    let suc = 'Success';
    try{
      const res = await  this.db(SCHEDULE_TABLE).where({'user_id': schedule.user_id, 'task_id': schedule.task_id, 'slot_id':schedule.slot_id}).update('slot_id',slot);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  // }

  async getUserCategories(user_id: string): Promise<Array<number>> {
    const dataArr = new Array<number>();

    const res = await this.db.from(CATEGORY_SLOT_TABLE).distinct('category_id').where('user_id',parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(parseInt(value.category_id))
    });
    return  dataArr;
  }

  async getUserCategorySlots(user_id: string): Promise<Array<number>> {
    const dataArr = new Array<number>();

    const res = await this.db.from(CATEGORY_SLOT_TABLE).select('*').where('user_id',parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });


    return dataArr;


  }
  async getSchedule(user_id: string): Promise<Array<number>> {
    const dataArr = new Array<number>();

    const res = await this.db.from(SCHEDULE_TABLE).select('*').where('user_id',parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });


    return dataArr;


  }

  async deleteSchedule(user_id: string): Promise<string> {
    let suc = 'Success';
    try{
      // console.log(schedule);
      // console.log("tryting to update user "+user_id+" slot "+slot_id+"with the next: "+schedule.taskID);
      const res = await  this.db(SCHEDULE_TABLE).where('user_id',parseInt(user_id)).del();
    }
    catch (e){
      suc = e
    }
    return suc;

  }

  async deleteUserCategories(user_id: string): Promise<string> {
    let suc = 'Success';
    try{
      const res = await  this.db(CATEGORY_SLOT_TABLE).where('user_id',parseInt(user_id)).del();
    }
    catch (e){
      suc = e
    }
    return suc;

  }

  async deleteTasks(user_id: string, task_ids: Array<number>): Promise<string> {
    let suc = 'Success';
    try{
      // console.log(schedule);
      // console.log("tryting to update user "+user_id+" slot "+slot_id+"with the next: "+schedule.taskID);
      const res = await  this.db(TASK_TABLE).where('user_id',user_id).whereIn('task_id',task_ids).del();
    }
    catch (e){
      suc = e
    }
    return suc;

  }
}
