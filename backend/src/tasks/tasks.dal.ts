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
import {CreateUserDto} from "../Dto's/createUser.dto";
import {CreateCategoryDto} from "../Dto's/createCategoryDto";

const TASK_TABLE = 'tasks_table';
const CATEGORY_SLOT_TABLE = 'category_slots';
const CATEGORY_LOOKUP_TABLE = 'category_lookup';
const SCHEDULE_TABLE = 'scheduled_tasks';
const USERS_TABLE = 'user_table';
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
      //Constraints data is saved as a string of 21 chars, where each 3 chars (morning,noon,evening)
      // represent user's preference to assign task to the corresponding time of day.
      if (value.constraints.length != 21){
        value.constraints = null;
      } else {
        const all_constraints = [];
        for (let i = 0; i<21; i++){
          const day_constraint = []
          day_constraint.push(parseInt(value.constraints[i]));
          i++;          
          day_constraint.push(parseInt(value.constraints[i]));
          i++;          
          day_constraint.push(parseInt(value.constraints[i]));
          all_constraints.push(day_constraint);
        }
        value.constraints = all_constraints;
      }
      dataArr.push(value)
    });
    return  { tasks: dataArr };
  }
  async getTasks(user_id: string): Promise<ToDoList> {
    const dataArr = [];
     const res = await this.db.from(TASK_TABLE).select('*').where('user_id',parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return  { tasks: dataArr };
  }

  async postTasks(tasks: any): Promise<string> {
    console.log(tasks);
    let suc = 'Success';

    for (const task in tasks){
      if (tasks[task].constraints === "000000000000000000000"){
        tasks[task].constraints = "111111111111111111111"
      }
    }
    try{
      const res = await  this.db(TASK_TABLE).insert(tasks);
    }
    catch (e){
      suc = e
    }
    return suc;  }

  async updateTasks(tasks: any): Promise<any> {

    console.log(tasks);
    const queries = [];
    tasks.forEach(task=>{
    if(task.task_id===undefined){
      task.task_id = null;
    }

      const q = "INSERT INTO "+TASK_TABLE+" VALUES(" +
          task.task_id+", " +
          task.user_id+", '" +
          task.task_title+"', " +
          task.duration+", " +
          task.priority+", " +
          task.category_id+", " +
          task.constraints+", " +
          task.recurrings+"," +
          task.pinned_slot+")ON DUPLICATE KEY UPDATE " +
          "`duration` = " + task.duration +
          ", `task_title` = '" + task.task_title +
          "', `priority` = " + task.priority +
          ", `category_id` = " + task.category_id+
          ", `constraints` = '" + task.constraints+
          "', `recurrings` = " + task.recurrings +
          ", `pinned_slot` = " + task.pinned_slot
      queries.push(q)
    })
    //
    // "INSERT INTO "+CATEGORY_LOOKUP_TABLE+" VALUES(" +
    // category.user_id +
    // ", " + category.category_i   d +
    // ", '" + category.category_name +
    // "', '" + category.color +
    // "') ON DUPLICATE KEY UPDATE " +
    // "category_name='" + category.category_name +
    // "', color='" + category.color +
    // "'"

  // console.log(queries);
  return this.db.transaction(trx => {

    const whole_query = [];
    queries.forEach(quer =>{
      whole_query.push(this.db.raw(quer).transacting(trx),
      )
    } );


    return Promise.all(whole_query);
  });


  }

  async updateScheduledTasks(slots: any): Promise<any> {
    console.log(slots);
    const queries = [];
    slots.forEach(slot=>{
      queries.push(
          "delete from "+SCHEDULE_TABLE+
          " where `slot_id`=" + slot.slot_id +
          " and `task_id`=" + slot.task_id+
          " and `user_id`=" + slot.user_id
      )
    })
    slots.forEach(slot=>{
      queries.push(
          "insert into "+SCHEDULE_TABLE+ "(user_id, slot_id, task_id) " +
          "values ("+slot.user_id+","+slot.new_slot+","+slot.task_id+")"
      )
    })

  // console.log(queries);
  return this.db.transaction(trx => {

    const whole_query = [];
    queries.forEach(quer =>{
      whole_query.push(this.db.raw(quer).transacting(trx),
      )
    } );


    return Promise.all(whole_query);
  });


  }
 // async updateScheduledTasks(slots: any): Promise<any> {
 //
 //    console.log(slots);
 //    const queries = [];
 //    slots.forEach(slot=>{
 //      queries.push(
 //          "update "+SCHEDULE_TABLE+
 //          " set `task_id` = " + slot.task_id +
 //          ", `user_id` = " + slot.user_id +
 //          ", `slot_id` = " + slot.new_slot +
 //          " where `user_id`=" + slot.user_id +
 //          " and `slot_id`=" + slot.slot_id
 //      )
 //    })
 //
 //  // console.log(queries);
 //  return this.db.transaction(trx => {
 //
 //    const whole_query = [];
 //    queries.forEach(quer =>{
 //      whole_query.push(this.db.raw(quer).transacting(trx),
 //      )
 //    } );
 //
 //
 //    return Promise.all(whole_query);
 //  });
 //
 //
 //  }


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

  async PostCategorySlots(categories: Array<CreateCategorySlotDto>){
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

  //  USERS:


  async checkUserCredentials(user: CreateUserDto){
    const res = this.db(USERS_TABLE).select('*').where({'user_name': user['user_name']});
    return  res;
  }

  async postNewUser(user: CreateUserDto){
    let suc = 'Success';
    try{

      const res = await  this.db(USERS_TABLE).insert(user);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

//Categories
  async postCategories(categories: Array<CreateCategoryDto>){

    console.log(categories);
    const queries = [];
    categories.forEach(category=>{
      queries.push(
          // "INSERT INTO "+CATEGORY_LOOKUP_TABLE+" VALUES(" +
          // " `user_id` = " + category.user_id +
          // ", `category_id` = " + category.category_id +
          // ", `category_name` = '" + category.category_name +
          // "', `category` = '" + category.color +
          // "') ON DUPLICATE KEY UPDATE " +
          // "user_id="+ category.user_id +
          // "category_name=" + category.category_name +
          // "color=" + category.color

          "INSERT INTO "+CATEGORY_LOOKUP_TABLE+" VALUES(" +
          category.user_id +
          ", " + category.category_id +
          ", '" + category.category_name +
          "', '" + category.color +
          "') ON DUPLICATE KEY UPDATE " +
          "category_name='" + category.category_name +
          "', color='" + category.color +
          "'"
      )
    })

    // console.log(queries);
    return this.db.transaction(trx => {

      const whole_query = [];
      queries.forEach(quer =>{
        whole_query.push(this.db.raw(quer).transacting(trx),
        )
      } );


      return Promise.all(whole_query);
    });
  }


  async getCategories(user_id: string): Promise<Array<CreateCategoryDto>> {
    const dataArr = new Array<CreateCategoryDto>();

    const res = await this.db.from(CATEGORY_LOOKUP_TABLE).select('*').where('user_id',parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return  dataArr;
  }


}

