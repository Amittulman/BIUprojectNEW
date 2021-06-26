import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {SchedulerService} from "../scheduler/scheduler.service";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {CreateCategoryDto} from "../Dto's/createCategoryDto";

//constants:
const default_category = -1;
const empty_slot = -1;

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService, private readonly schedulerService: SchedulerService) {
  }
  //Method that runs the scheduling algorithm
  @Get('trig/:id/:slot')
  async trig(@Param('id') user_id: string, @Param('slot') current_time_slot: number): Promise<any[]> {
    console.log(current_time_slot)
    const tasks = await this.getToDoList(user_id);
    if(typeof tasks[0] === undefined){
      return null;
    }
    const categorySlots = await this.getUserCategorySlots(user_id);
    const errorTasks = await this.checkTasksErrors(tasks.tasks, current_time_slot, user_id, categorySlots);
    if (errorTasks.length > 0) {
      return [null, errorTasks];
    }
    const result = await this.schedulerService.tryCalc(tasks,categorySlots, current_time_slot);
    let res;
    //change slots to scheduledTask
    //post slots to DB
    if (result != null) { // there is a solution
      console.log(await this.deleteSchedule(user_id));
      const success = await this.postSchedule(result,user_id);
      console.log(success);
      res = result;
    }
    else {
      res = null;
    }
    return [res,null];
  }

  //Gets all user's tasks, with constraints as an array
  @Get('GetToDoList/:id')
  async getToDoList(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.GetToDoList(user_id);
  }

  //Gets all user's tasks, with constraints as a string
  @Get('GetTasks/:id')
  async getTasks(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.getTasks(user_id);
  }

  //Inserts user's tasks in db
  @Post('PostTasks/:tasks')
  postTasks(@Body() tasksArray: Array<CreateTaskDto>) {
    return this.tasksService.postTasks(tasksArray);
  }

  //Upserts user's tasks in db
  @Post('UpdateTasks/:tasks')
  updateTasks(@Body() tasks_array: Array<CreateTaskDto>) {
    return this.tasksService.updateTasks(tasks_array);
  }


  /// Scheduled tasks:
  //Gets the schedule for a user, in an array of 337 slots, where "-1" is an empty slot
  @Get('GetSchedule/:id')
  async getSchedule(@Param('id') user_id: string): Promise<Array<number>> {
    return this.tasksService.getSchedule(user_id);
  }

  //Updates user's scheduled tasks (the ones that already have assigned slots)
  @Post('UpdateScheduledTasks/:tasks')
  updateScheduledTasks(@Body() tasks_array: Array<CreateTaskDto>) {
    return this.tasksService.updateScheduledTasks(tasks_array);
  }

  //Gets a the task that is scheduled for a specific slot of a given user
  @Get('GetScheduleTask/:id/:slot')
  async getScheduleTask(@Param('id') user_id: string, @Param('slot') slot_id:string): Promise<ScheduledTask> {
    return this.tasksService.getScheduleTask(user_id,slot_id);
  }

  //Gets all the scheduled tasks of a given user
  @Get('GetAllScheduledTasks/:user_id')
  async getAllScheduledTasks(@Param('user_id') user_id: string): Promise<Array<ScheduledTask>> {
    return this.tasksService.getAllScheduledTasks(user_id);
  }

  //Inserts the schedule for the user
  @Post('PostSchedule/:user_id')
  postSchedule(@Body() tasks_array: Array<number>, @Param('user_id')user_id:string) {
    return this.tasksService.postSchedule(tasks_array, user_id);
  }

  //Changes the slot number of a given scheduled task
  @Post('UpdateSchedule/:new_slot')
  updateScheduleSlot(@Body() task: CreateScheduledTaskDto, @Param('new_slot')slot_id:number) {
    console.log(task)
    return this.tasksService.updateScheduleSlot(task, slot_id);
  }


  ///Categories-Slots related API:
  //Gives the categories that are assigned to the schedule - 336 slots array, -1 for default category
  @Get('GetUserCategorySlots/:id')
  async getUserCategorySlots(@Param('id') user_id: string): Promise<Array<number>> {
    return this.tasksService.getUserCategorySlots(user_id);
  }

  //Inserts the categories the user assigned to his schedule
  @Post('PostCategorySlots/:user_id')
  postCategorySlots(@Body() category_slots: Array<number>, @Param('user_id')user_id:string) {
    return this.tasksService.postCategorySlots(category_slots,user_id);
  }

  //Deletes the schedule for a given user
  @Delete('DeleteSchedule/:id')
  async deleteSchedule(@Param('id') user_id: string): Promise<string> {
    return this.tasksService.deleteSchedule(user_id);
  }

  //Deletes the category slots that a given user has
  @Delete('DeleteUserCategories/:id')
  async deleteUserCategories(@Param('id') user_id: string): Promise<string> {
    return this.tasksService.deleteUserCategories(user_id);
  }

  //Deletes all the tasks given in the array for a given user
  @Delete('DeleteTasks/:user_id')
  deleteTasks(@Body() tasksArray: Array<number>, @Param('user_id')user_id:string) {
    return this.tasksService.deleteTasks(user_id, tasksArray);
  }

  ///User related API:
  //Requests the credentials of a given user - username and hashed password
  @Post('CheckUserCredentials/')
  checkUserCredentials(@Body() user: CreateUserDto) {
    console.log(user)
    return this.tasksService.checkUserCredentials(user);
  }

  //Posts a new user for given username and password
  @Post('PostNewUser/')
  postNewUser(@Body() user: CreateUserDto) {
    console.log(user)
    return this.tasksService.postNewUser(user);
  }

  //returns the name of a user by id
  @Get('getUsernameByID/:user_id')
  getUsernameByID(@Param('user_id')user_id:string){
    return this.tasksService.getUsernameByID(user_id);
  }

  //returns the id of a user by name
  @Get('getUserIdByName/:user_name')
  getUserIdByName(@Param('user_name')user_name:string){
    return this.tasksService.getUserIdByName(user_name);
  }

  //Deletes all the users who's id is in a given array
  @Delete('DeleteUsers/')
  deleteUsers(@Body() users: Array<number>) {
    return this.tasksService.deleteUsers(users);
  }




  /// Categories Lookup:
  @Post('PostCategories/')
  postCategories(@Body() categories: Array<CreateCategoryDto>) {
    return this.tasksService.postCategories(categories);
  }

  @Get('GetCategories/:id')
  async getCategories(@Param('id') user_id: string): Promise<Array<CreateCategoryDto>> {
    return this.tasksService.getCategories(user_id);
  }

  async checkTasksErrors(tasks: Array<any>, timeStamp: number, userID : string, categories : Array<number>): Promise<any> {
    const day = Math.floor(timeStamp/48);
    const leftDays = 7-day;
    const problemTasks = [];

    for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
      const tempTask = tasks[taskIndex];
      const tempTaskID = tempTask.task_id;
      const tempReccuring = tempTask.recurrings;
      const tempConstraint = tempTask.constraints;
      const slotnum = Math.ceil(tempTask.duration/30); // calc how many slots the task needs
      const slotsneed = slotnum*tempTask.recurrings

      const tempErrorTask = [tempTaskID,0,0,0];


      if(tempReccuring > leftDays) {
        //problem with this task - reccuringg
        tempErrorTask[1] = 1;
      }

      const curSlot = timeStamp-12;
      const day = Math.floor(curSlot/48);
      const toMinus = day*48;
      const temp = curSlot-toMinus;
      let partOfTheDay = Math.floor(temp/12);
      if (partOfTheDay === 3) {
        partOfTheDay = 2;
      }

      // check constraints and if there is 1 from current day to the end.
      let constraintEnough = false;
      let CounterForDaysConstraints = 0;
      for(let constraintIndex = day; constraintIndex < tempTask.constraints.length ; constraintIndex++) {
        const isMorningConstraint = tempConstraint[constraintIndex][0] === 1;
        const isNoonConstraint = tempConstraint[constraintIndex][1] === 1;
        const isNightConstraint = tempConstraint[constraintIndex][2] === 1;

        if (partOfTheDay === 2) { // night now
          if (isNightConstraint) {
            constraintEnough = true;
            CounterForDaysConstraints += 1;
          }
        } else if (partOfTheDay === 1) { //noon now
          if (isNoonConstraint || isNightConstraint) {
            constraintEnough = true;
            CounterForDaysConstraints += 1;
          }
        } else if (partOfTheDay === 0) { // morning now
          if (isNoonConstraint || isNightConstraint || isMorningConstraint) {
            constraintEnough = true;
            CounterForDaysConstraints += 1;
          }
        } else {
          break;
        }
      }

      if(!constraintEnough || CounterForDaysConstraints < tempReccuring) {
        //problem with this task - constraints
        tempErrorTask[2] = 1;
      }

      const numOfSlots = Math.ceil(tempTask.duration/30);
      let start = timeStamp;
      let end = timeStamp;
      const curCategory = tempTask.category_id;

      let isCaregoriesEnough = false;
      let currSlot = [];
      const spots = []; // the result - all the options
      let counterTemp = 0;
      let bigCounter = 0;

      while (end < categories.length){
        if (curCategory === categories[end]) {
          currSlot.push(end); // we can use this slot
          counterTemp += 1;
          if (counterTemp === numOfSlots) {
            const CopyForPushCurrSlot  = Object.assign([], currSlot);
            spots.push(currSlot);
            bigCounter += counterTemp;
            if(bigCounter === slotsneed) {
              isCaregoriesEnough = true;
              break;
            }
            //end = await this.jumpNextDay(end)
            //currSlot= [];
            counterTemp = 0;
          }
        } else {
          start = end+1;
          currSlot = [];
        }
        end += 1;
      }

      if(!isCaregoriesEnough) {
        //problem with this task - categories
        tempErrorTask[3] = 1;
      }

      if(tempErrorTask[1] != 0 || tempErrorTask[2] != 0 || tempErrorTask[3] != 0) {
        problemTasks.push(tempErrorTask)
      }
    }
    return problemTasks;
  }

  async jumpNextDay(curSlot: number): Promise<any> {
    const day = Math.floor(curSlot/48);
    const newSlot = (day+1)*48;
    return newSlot;
  }
}