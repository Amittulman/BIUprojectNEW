import {Inject, Injectable} from '@nestjs/common';

import {Knex} from "knex";
import {OUR_DB} from "../constants";
import {ToDoList} from "../interfaces/todo.interface";
import {Task} from "../interfaces/task.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {CreateCategoryDto} from "../Dto's/createCategoryDto";

//Constants
const TASK_TABLE = 'tasks_table';
const CATEGORY_SLOT_TABLE = 'category_slots';
const CATEGORY_LOOKUP_TABLE = 'category_lookup';
const SCHEDULE_TABLE = 'scheduled_tasks';
const USERS_TABLE = 'user_table';
const SUCCESS = 'Success';
const NULL_CONSTRAINTS = "000000000000000000000";
const FULL_CONSTRAINTS = "111111111111111111111";
const USER_ID = 'user_id';
const USER_NAME = 'user_name';
const CATEGORY_ID = 'category_id';
const TASK_ID = 'task_id';
const SLOT_ID = 'slot_id';
const NEXT_WEEK = 'next_week';
const ERROR = '-1';
@Injectable()
export class TasksDal {

  constructor(@Inject(OUR_DB) private db:Knex) {
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

    const res = await this.db.from(TASK_TABLE).select('*').where(USER_ID,parseInt(user_id));
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
     const res = await this.db.from(TASK_TABLE).select('*').where(USER_ID,parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return  { tasks: dataArr };
  }

  async postTasks(tasks: any): Promise<string> {
    console.log(tasks);
    let suc = SUCCESS;
    for (const task in tasks){
      if (tasks[task].constraints === NULL_CONSTRAINTS){
        tasks[task].constraints = FULL_CONSTRAINTS;
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
    if (task.constraints === NULL_CONSTRAINTS){
      task.constraints = FULL_CONSTRAINTS;
    }

      const quer = "INSERT INTO "+TASK_TABLE+" VALUES(" +
          task.task_id+", " +
          task.user_id+", '" +
          task.task_title+"', " +
          task.duration+", " +
          task.priority+", " +
          task.category_id+", '" +
          task.constraints+"', " +
          task.recurrings+"," +
          task.pinned_slot+")ON DUPLICATE KEY UPDATE " +
          "`duration` = " + task.duration +
          ", `task_title` = '" + task.task_title +
          "', `priority` = " + task.priority +
          ", `category_id` = " + task.category_id+
          ", `constraints` = '" + task.constraints+
          "', `recurrings` = " + task.recurrings +
          ", `pinned_slot` = " + task.pinned_slot
      queries.push(quer)
    })
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
  return this.db.transaction(trx => {
    const whole_query = [];
    queries.forEach(quer =>{
      whole_query.push(this.db.raw(quer).transacting(trx),
      )
    } );
    return Promise.all(whole_query);
  });
  }

  async getScheduleTask(user_id: string, slot_id:string): Promise<ScheduledTask> {
    const res = await this.db(SCHEDULE_TABLE).select('*').where({USER_ID: parseInt(user_id), SLOT_ID: parseInt(slot_id)});
    return res[0];
  }

  async getAllScheduledTasks(user_id: string): Promise<Array<ScheduledTask>> {
    const res = await this.db(SCHEDULE_TABLE).select('*').where({USER_ID: parseInt(user_id)});
    const result:Array<ScheduledTask> = res[0];
    return result;
  }

  async postSchedule(schedule: Array<CreateScheduledTaskDto>){
    let suc = SUCCESS;
    try{
    const res = await  this.db(SCHEDULE_TABLE).insert(schedule);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async postCategorySlots(categories: Array<CreateCategorySlotDto>){
    let suc = SUCCESS;
    try{
    const res = await this.db(CATEGORY_SLOT_TABLE).insert(categories);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async updateScheduleSlot(schedule: CreateScheduledTaskDto, slot: number){
    let suc = SUCCESS;
    try{
      const res = await  this.db(SCHEDULE_TABLE).where({USER_ID: schedule.user_id, TASK_ID: schedule.task_id, SLOT_ID:schedule.slot_id}).update(SLOT_ID,slot);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async getUserCategories(user_id: string): Promise<Array<number>> {
    const dataArr = new Array<number>();
    const res = await this.db.from(CATEGORY_SLOT_TABLE).distinct(CATEGORY_ID).where(USER_ID,parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(parseInt(value.category_id))
    });
    return  dataArr;
  }

  async getUserCategorySlots(user_id: string): Promise<Array<number>> {
    const dataArr = new Array<number>();
    const res = await this.db.from(CATEGORY_SLOT_TABLE).select('*').where(USER_ID,parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return dataArr;
  }

  async getSchedule(user_id: string): Promise<Array<number>> {
    const dataArr = new Array<number>();
    const res = await this.db.from(SCHEDULE_TABLE).select('*').where(USER_ID,parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return dataArr;


  }
  async deleteSchedule(user_id: string): Promise<string> {
    let suc = SUCCESS;
    try{
      const res = await  this.db(SCHEDULE_TABLE).where(USER_ID,parseInt(user_id)).del();
    }
    catch (e){
      suc = e
    }
    return suc;

  }

  async deleteUserCategories(user_id: string): Promise<string> {
    let suc = SUCCESS;
    try{
      const res = await  this.db(CATEGORY_SLOT_TABLE).where(USER_ID,parseInt(user_id)).del();
    }
    catch (e){
      suc = e
    }
    return suc;

  }

  async deleteTasks(user_id: string, task_ids: Array<number>): Promise<string> {
    let suc = SUCCESS;
    try{
      const res = await  this.db(TASK_TABLE).where(USER_ID,user_id).whereIn(TASK_ID,task_ids).del();
    }
    catch (e){
      suc = e
    }
    return suc;

  }


  //  USERS:


  async checkUserCredentials(user: CreateUserDto){
    const res = this.db(USERS_TABLE).select('*').where({USER_NAME: user[USER_NAME]});
    return  res;
  }

  async postNewUser(user: CreateUserDto){
    let suc = SUCCESS;
    try{
      const res = await  this.db(USERS_TABLE).insert(user);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async getUsernameByID(user_id: string){

    const res = await this.db.from(USERS_TABLE).select(USER_NAME).where(USER_ID,parseInt(user_id));
    if(res[0] === undefined){
      return ERROR;
    }
    return "{\"user_name\":\""+res[0][USER_NAME]+"\"}";
  }

  async getUserIdByName(user_name: string){
    const res = await this.db.from(USERS_TABLE).select(USER_ID).where(USER_NAME,user_name);
    const id:string = res[0][USER_ID];
    return id;
  }
  async postNextWeek(user_id : number, next_week: boolean){
    let suc = SUCCESS;
    try{
      const res = await this.db(USERS_TABLE).where({USER_ID: user_id}).update(NEXT_WEEK,next_week);
    }
    catch (e){
      suc = e
    }
    return suc;
  }

  async deleteUsers(users: Array<number>): Promise<string> {
    let suc = SUCCESS;
    try{
      const res = await  this.db(USERS_TABLE).whereIn(USER_ID,users).del();
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
    const res = await this.db.from(CATEGORY_LOOKUP_TABLE).select('*').where(USER_ID,parseInt(user_id));
    res.forEach(function(value) {
      dataArr.push(value)
    });
    return  dataArr;
  }


}

