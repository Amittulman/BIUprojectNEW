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
const default_recurrings = 1;
const empty_slot = -1;
const slots_in_week = 336;
const default_category_slots = [2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,2,2,2,2,2,2,2,2,2,2,2,2,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1,-1];


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
        user_id : tasks_array[task]['user_id'],
        task_title : tasks_array[task]['task_title'],
        duration: tasks_array[task]['duration'],
        priority: tasks_array[task]['priority'],
        category_id: tasks_array[task]['category_id'],
        constraints: tasks_array[task]['constraints'],
        recurrings: tasks_array[task]['recurrings'],
        pinned_slot: tasks_array[task]['pinned_slot']

      };
      if (tasks_array[task]['recurrings'] === undefined){
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
        task_id : tasks_array[task]['task_id'],
        user_id : tasks_array[task]['user_id'],
        slot_id : tasks_array[task]['slot_id'],
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
        task_id : tasks_array[task]['task_id'],
        user_id : tasks_array[task]['user_id'],
        task_title : tasks_array[task]['task_title'],
        duration: tasks_array[task]['duration'],
        priority: tasks_array[task]['priority'],
        category_id: tasks_array[task]['category_id'],
        constraints: tasks_array[task]['constraints'],
        recurrings: tasks_array[task]['recurrings'],
        pinned_slot: tasks_array[task]['pinned_slot']

      };
      if (tasks_array[task]['recurrings'] === undefined){
        schedule_task.recurrings = 1;
      }
      if (tasks_array[task]['pinned_slot'] === undefined){
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
      schedule_array[result[slot]['slot_id']] = result[slot]['task_id']
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
      category_slots_array[result[slot]['slot_id']]   = result[slot]['category_id']
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
      return "-1";
    }
    //Return a JSON object
    return "{\"user_pass\":\""+ret_user['user_pass']+"\"," +
        "\"user_id\":\""+ret_user['user_id']+"\","+
        "\"next_week\":\""+ret_user['next_week']+"\"}";
  }

  async postNewUser(user: CreateUserDto): Promise<string>{
    user["next_week"] = false;
    const res = await this.tasksDal.postNewUser(user);
    if(res === "Success"){
      const user_id:string = await this.getUserIdByName(user['user_name']);
      console.log(user_id);
      await this.postCategorySlotsFromArray(default_category_slots,user_id)
      return this.checkUserCredentials(user);
    }
    else if(res['code'] === 'ER_DUP_ENTRY'){
      return "-1";
    }
    else{
      return res['code'];
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
    console.log("Posting this categorys: "+array_of_category_slots)
    return this.tasksDal.postCategorySlots(array_of_category_slots);
  }


}