import {Injectable, Param} from '@nestjs/common';
import {Task} from "../interfaces/task.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {ToDoList} from "../interfaces/todo.interface";
import {CreateScheduledTaskDto} from "../Dto\'s/createScheduledTask.dto";
import {TasksDal} from "./tasks.dal";
import {CreateTaskDto} from "../Dto's/createTask.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {CreateCategoryDto} from "../Dto's/createCategoryDto";

const default_category = -1;
const empty_slot = -1;
const slots_in_week = 336;
const default_category_slots = [2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];
const USER_ID = 'user_id';
const USER_NAME = 'user_name';
const CATEGORY_ID = 'category_id';
const TASK_ID = 'task_id';
const SLOT_ID = 'slot_id';
const TASK_TITLE = 'task_title';
const PRIORITY = 'priority';
const DURATION = 'duration';
const CONSTRAINTS = 'constraints';
const RECURRINGS = 'recurrings';
const DUPLICATE_ENTRY_ERROR = 'ER_DUP_ENTRY';
const CODE = 'code';
const USER_PASS = 'user_pass';
const NEXT_WEEK = 'next_week';
const PINNED_SLOT = 'pinned_slot';
const SUCCESS = 'Success';
const ERROR_CODE = '-1';


@Injectable()
export class TasksService {
  constructor(private readonly tasksDal: TasksDal) {}

  async postTask(task: Task): Promise<void> {
    return this.tasksDal.postTask(task);
  }

  async GetToDoList(user_id): Promise<ToDoList> {
    return this.tasksDal.GetToDoList(user_id);
  }

  async getTasks(user_id): Promise<ToDoList> {
    return this.tasksDal.getTasks(user_id);
  }

  async postTasks(tasks_array: Array<CreateTaskDto>): Promise<string> {
    const tasks:Array<CreateTaskDto> = [];
    for(const task in tasks_array){
      const schedule_task:CreateTaskDto = {
        task_id : null,
        user_id : tasks_array[task][USER_ID],
        task_title : tasks_array[task][TASK_TITLE],
        duration: tasks_array[task][DURATION],
        priority: tasks_array[task][PRIORITY],
        category_id: tasks_array[task][CATEGORY_ID],
        constraints: tasks_array[task][CONSTRAINTS],
        recurrings: tasks_array[task][RECURRINGS],
        pinned_slot: tasks_array[task][PINNED_SLOT]

      };
      if (tasks_array[task][RECURRINGS] === undefined){
        schedule_task.recurrings = 1;
      }
      tasks.push(schedule_task);
    }
    return this.tasksDal.postTasks(tasks);
  }

  async updateScheduledTasks(tasks_array: Array<any>): Promise<string> {
    const tasks:Array<any> = [];
    for(const task in tasks_array){
      const schedule_task:any = {
        task_id : tasks_array[task][TASK_ID],
        user_id : tasks_array[task][USER_ID],
        slot_id : tasks_array[task][SLOT_ID],
        new_slot : tasks_array[task]['new_slot']
      };
      tasks.push(schedule_task);
    }
    return this.tasksDal.updateScheduledTasks(tasks);
  }

  async updateTasks(tasks_array: Array<CreateTaskDto>): Promise<any> {
    const tasks:Array<CreateTaskDto> = [];
    for(const task in tasks_array){
      const schedule_task:CreateTaskDto = {
        task_id : tasks_array[task][TASK_ID],
        user_id : tasks_array[task][USER_ID],
        task_title : tasks_array[task][TASK_TITLE],
        duration: tasks_array[task][DURATION],
        priority: tasks_array[task][PRIORITY],
        category_id: tasks_array[task][CATEGORY_ID],
        constraints: tasks_array[task][CONSTRAINTS],
        recurrings: tasks_array[task][RECURRINGS],
        pinned_slot: tasks_array[task][PINNED_SLOT]

      };
      if (tasks_array[task][RECURRINGS] === undefined){
        schedule_task.recurrings = 1;
      }
      if (tasks_array[task][PINNED_SLOT] === undefined){
        schedule_task.pinned_slot = null;
      }
      tasks.push(schedule_task);
    }

    return this.tasksDal.updateTasks(tasks);
  }


  async getSchedule(user_id):Promise<Array<number>>{
    const result = await this.tasksDal.getSchedule(user_id)
    const schedule_array = new Array<number>(slots_in_week);
    schedule_array.fill(empty_slot)
    for (const slot in result){
      schedule_array[result[slot][SLOT_ID]] = result[slot][TASK_ID]
    }

    return schedule_array;
  }
  async getScheduleTask(user_id, slot_id):Promise<ScheduledTask>{
    return this.tasksDal.getScheduleTask(user_id, slot_id);
  }
  async getAllScheduledTasks(user_id):Promise<Array<ScheduledTask>>{
    return this.tasksDal.getAllScheduledTasks(user_id);
  }

  async postSchedule(tasks_array: Array<number>, user_id:string): Promise<string>{
    const schedule:Array<CreateScheduledTaskDto> = [];
    for(const task in tasks_array){
      if (tasks_array[task] != empty_slot){
        const schedule_task:CreateScheduledTaskDto = {
          task_id: tasks_array[task],
          user_id : parseInt(user_id),
          slot_id : parseInt(task)
        };
        schedule.push(schedule_task);
      }
    }
    return this.tasksDal.postSchedule(schedule);
  }
  async postCategorySlots(category_slots: Array<number>,user_id:string): Promise<string>{
    const categories: Array<CreateCategorySlotDto> = [];
    for (const slot in category_slots) {
      if (category_slots[slot] != default_category) {
        const category_slot: CreateCategorySlotDto = {
          category_id: category_slots[slot],
          user_id: parseInt(user_id),
          slot_id: parseInt(slot)
        };
        categories.push(category_slot);

      }
    }
    return this.tasksDal.postCategorySlots(categories);
  }
  async updateScheduleSlot(createScheduleDto: CreateScheduledTaskDto, slot: number): Promise<string>{
    return this.tasksDal.updateScheduleSlot(createScheduleDto, slot);
  }

  async getUserCategories(user_id):Promise<Array<number>>{
    return this.tasksDal.getUserCategories(user_id);
  }
  async getUserCategorySlots(user_id):Promise<Array<number>>{
    const result = await this.tasksDal.getUserCategorySlots(user_id);
    const category_slots_array = new Array<number>(slots_in_week);
    category_slots_array.fill(default_category)
    for (const slot in result){
      category_slots_array[result[slot][SLOT_ID]]   = result[slot][CATEGORY_ID]
    }
    return category_slots_array;
  }
  async deleteSchedule(user_id):Promise<string>{
    return this.tasksDal.deleteSchedule(user_id);
  }

  async deleteUserCategories(user_id):Promise<string>{
    return this.tasksDal.deleteUserCategories(user_id);
  }

  async deleteTasks(user_id: string, task_ids: Array<number>):Promise<string>{
    return this.tasksDal.deleteTasks(user_id, task_ids);
  }

  async checkUserCredentials(user: CreateUserDto): Promise<string>{

    let ret_user = await this.tasksDal.checkUserCredentials(user);
    ret_user = ret_user[0];
    if(ret_user === undefined){
      return ERROR_CODE;
    }
    //Return a JSON object
    return "{\"user_pass\":\""+ret_user[USER_PASS]+"\"," +
        "\"user_id\":\""+ret_user[USER_ID]+"\","+
        "\"next_week\":\""+ret_user[NEXT_WEEK]+"\"}";
  }

  async postNewUser(user: CreateUserDto): Promise<string>{
    user[NEXT_WEEK] = false;
    const res = await this.tasksDal.postNewUser(user);
    if(res === SUCCESS){
      const user_id:string = await this.getUserIdByName(user[USER_NAME]);
      console.log(user_id);
      await this.postCategorySlotsFromArray(default_category_slots,user_id)
      return this.checkUserCredentials(user);
    }
    else if(res[CODE] === DUPLICATE_ENTRY_ERROR){
      return ERROR_CODE;
    }
    else{
      return res[CODE];
    }

  }
  async getUsernameByID(user_id: string):Promise<string>{
    return this.tasksDal.getUsernameByID(user_id);
  }

  async postNextWeek(user_id : number, next_week: boolean):Promise<string>{
    return this.tasksDal.postNextWeek(user_id, next_week);
  }

  async getUserIdByName(user_name: string):Promise<string>{
    return this.tasksDal.getUserIdByName(user_name);
  }

  async deleteUsers(users: Array<number>):Promise<string>{
    return this.tasksDal.deleteUsers(users);
  }

  async postCategories(categories: Array<CreateCategoryDto>): Promise<any>{
    return this.tasksDal.postCategories(categories);

}

  async getCategories(user_id):Promise<Array<CreateCategoryDto>>{
    return this.tasksDal.getCategories(user_id);
  }

  async postCategorySlotsFromArray(cat_slots:Array<number>, user_id:string){
    const array_of_category_slots:Array<CreateCategorySlotDto> = [];
    for(const index in cat_slots){
      array_of_category_slots.push({
        category_id : cat_slots[parseInt(index)],
        user_id : parseInt(user_id),
        slot_id : parseInt(index)
      })
    }
    console.log("Posting these categories: "+array_of_category_slots)
    return this.tasksDal.postCategorySlots(array_of_category_slots);
  }


}
