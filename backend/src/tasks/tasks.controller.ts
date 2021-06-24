import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {SchedulerService} from "../scheduler/scheduler.service";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";
import {CreateUserDto} from "../Dto's/createUser.dto";
import {CreateCategoryDto} from "../Dto's/createCategoryDto";
import {Task} from "../interfaces/task.interface";

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService, private readonly schedulerService: SchedulerService) {
  }

  @Get('GetHello')
  async getHello(): Promise<string> {
    return this.tasksService.getHello();
  }

  @Get('GetTry')
  async getTry(): Promise<void> {
    //this.schedulerService.tryCalc([]);
  }
  //
  // @Post('TaskForToDoList/:createTaskDto')
  // postTask(@Body() createTaskDto: CreateTaskDto) {
  //   return this.tasksService.postTask(createTaskDto); //TODO check DTO enforce
  // }

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

  @Get('GetToDoList/:id')
  async getToDoList(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.GetToDoList(user_id);
  }
  @Get('GetTasks/:id')
  async getTasks(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.getTasks(user_id);
  }

  @Post('PostTasks/:tasks')
  postTasks(@Body() tasksArray: Array<CreateTaskDto>) {
    // const tasks:Array<CreateTaskDto> = tasks_array;
    const tasks:Array<CreateTaskDto> = [];
    for(const task in tasksArray){
      const schedule_task:CreateTaskDto = {
        task_id : null,
        user_id : tasksArray[task]['user_id'],
        task_title : tasksArray[task]['task_title'],
        duration: tasksArray[task]['duration'],
        priority: tasksArray[task]['priority'],
        category_id: tasksArray[task]['category_id'],
        constraints: tasksArray[task]['constraints'],
        recurrings: tasksArray[task]['recurrings'],
        pinned_slot: tasksArray[task]['pinned_slot']

      };
      if (tasksArray[task]['recurrings'] === undefined){
        schedule_task.recurrings = 1;
      }
      tasks.push(schedule_task);
    }
    return this.tasksService.postTasks(tasks);
  }

  @Post('UpdateTasks/:tasks')
  updateTasks(@Body() tasksArray: Array<CreateTaskDto>) {
    const tasks:Array<CreateTaskDto> = [];
    for(const task in tasksArray){
      const schedule_task:CreateTaskDto = {
        task_id : tasksArray[task]['task_id'],
        user_id : tasksArray[task]['user_id'],
        task_title : tasksArray[task]['task_title'],
        duration: tasksArray[task]['duration'],
        priority: tasksArray[task]['priority'],
        category_id: tasksArray[task]['category_id'],
        constraints: tasksArray[task]['constraints'],
        recurrings: tasksArray[task]['recurrings'],
        pinned_slot: tasksArray[task]['pinned_slot']

      };
      if (tasksArray[task]['recurrings'] === undefined){
        schedule_task.recurrings = 1;
      }
      if (tasksArray[task]['pinned_slot'] === undefined){
        schedule_task.pinned_slot = null;
      }
      tasks.push(schedule_task);
    }

    return this.tasksService.updateTasks(tasks);
  }


@Post('UpdateScheduledTasks/:tasks')
updateScheduledTasks(@Body() tasksArray: Array<any>) {
    const tasks:Array<any> = [];
    for(const task in tasksArray){
      const schedule_task:any = {
        task_id : tasksArray[task]['task_id'],
        user_id : tasksArray[task]['user_id'],
        slot_id : tasksArray[task]['slot_id'],
        new_slot : tasksArray[task]['new_slot']
      };
      tasks.push(schedule_task);
    }

    return this.tasksService.updateScheduledTasks(tasks);
  }

  // @Post('TaskForToDoList/:createTaskDto')
  // createTask(@Body() createTaskDto: CreateTaskDto) {
  //   return this.tasksService.postTaskForToDoList(createTaskDto);
  // }


  // Scheduled tasks:
  @Get('GetSchedule/:id')
  async getSchedule(@Param('id') user_id: string): Promise<Array<number>> {
    const result = await this.tasksService.getSchedule(user_id);
    const schedule_array = new Array<number>(336);
    schedule_array.fill(-1)
    let i;


    for (const slot in result){
      schedule_array[result[slot]['slot_id']]   = result[slot]['task_id']
    }

    return schedule_array;
  }

  @Get('GetScheduleTask/:id/:slot')
  async getScheduleTask(@Param('id') user_id: string, @Param('slot') slot_id:string): Promise<ScheduledTask> {
    return this.tasksService.getScheduleTask(user_id,slot_id);
  }
  @Post('PostSchedule/:user_id')
  postSchedule(@Body() tasksArray: Array<number>, @Param('user_id')user_id:string) {
    const schedule:Array<CreateScheduledTaskDto> = [];
    for(const task in tasksArray){
      if (tasksArray[task] != -1){
        const schedule_task:CreateScheduledTaskDto = {
          task_id: tasksArray[task],
          user_id : parseInt(user_id),
          slot_id : parseInt(task)
        };
        schedule.push(schedule_task);

      }
    }
    return this.tasksService.postSchedule(schedule);
  }
  // @Post('UpdateSchedule/:new_slot')
  // updateScheduleSlot(@Body() task: CreateScheduledTaskDto, @Param('new_slot')slot : number) {
  //   console.log(task)
  //   return this.tasksService.updateScheduleSlot(task, slot);
  // }

  @Post('UpdateSchedule/:new_slot')
  updateScheduleSlot(@Body() task: CreateScheduledTaskDto, @Param('new_slot')slot_id:number) {
    console.log(task)
    return this.tasksService.updateScheduleSlot(task, slot_id);
  }


  //Categories-Slots shit

  @Get('GetUserCategorySlots/:id')
  async getUserCategorySlots(@Param('id') user_id: string): Promise<Array<number>> {
    const result = await this.tasksService.getUserCategorySlots(user_id);
    // console.log(result)
    const category_slots_array = new Array<number>(336);
    category_slots_array.fill(-1)

    for (const slot in result){
      category_slots_array[result[slot]['slot_id']]   = result[slot]['category_id']
    }
    return category_slots_array;
  }

  @Post('PostCategorySlots/:user_id')
  postCategorySlots(@Body() categorySlots: Array<number>, @Param('user_id')user_id:string) {
    const categories: Array<CreateCategorySlotDto> = [];
    for (const slot in categorySlots) {
      if (categorySlots[slot] != -1) {
        const category_slot: CreateCategorySlotDto = {
          category_id: categorySlots[slot],
          user_id: parseInt(user_id),
          slot_id: parseInt(slot)
        };
        categories.push(category_slot);

      }
    }
    return this.tasksService.PostCategorySlots(categories);
  }

  @Delete('DeleteSchedule/:id')
  async deleteSchedule(@Param('id') user_id: string): Promise<string> {
    return this.tasksService.deleteSchedule(user_id);
  }

  @Delete('DeleteUserCategories/:id')
  async deleteUserCategories(@Param('id') user_id: string): Promise<string> {
    return this.tasksService.deleteUserCategories(user_id);
  }


  @Delete('DeleteTasks/:user_id')
  deleteTasks(@Body() tasksArray: Array<number>, @Param('user_id')user_id:string) {
    return this.tasksService.deleteTasks(user_id, tasksArray);
  }

//USERS:
  @Post('CheckUserCredentials/')
  checkUserCredentials(@Body() user: CreateUserDto) {
    console.log(user)
    return this.tasksService.checkUserCredentials(user);
  }

  @Post('PostNewUser/')
  postNewUser(@Body() user: CreateUserDto) {
    console.log(user)
    return this.tasksService.postNewUser(user);
  }

  @Get('getUsernameByID/:user_id')
  getUsernameByID(@Param('user_id')user_id:string){
    return this.tasksService.getUsernameByID(user_id);
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

      let tempErrorTask = Array(tempTaskID,0,0,0);


      if(tempReccuring > leftDays) {
        //problem with this task - reccuringg
        tempErrorTask[1] = 1;
      }

      let curSlot = timeStamp-12;
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
        let isMorningConstraint = tempConstraint[constraintIndex][0] === 1;
        let isNoonConstraint = tempConstraint[constraintIndex][1] === 1;
        let isNightConstraint = tempConstraint[constraintIndex][2] === 1;

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
      let curCategory = tempTask.category_id;

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
    let newSlot = (day+1)*48;
    return newSlot;
  }
}
