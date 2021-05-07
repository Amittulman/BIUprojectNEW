import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {SchedulerService} from "../scheduler/scheduler.service";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {CreateCategorySlotDto} from "../Dto's/createCategorySlot.dto";

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

  @Get('trig/:id')
  async trig(@Param('id') user_id: string): Promise<any[]> {
    const tdl = await this.tasksService.GetToDoList(user_id);
    //const categorySlots = await  this. tasksService.getCategorySlots(user_id);
    const categorySlots = [1,1,1,1];
    const res = await this.schedulerService.tryCalc(tdl,categorySlots);

    console.log(res);


    console.log(await this.deleteSchedule(user_id));

    //change slots to scheduledTask
    //post slots to DB
    const success = await this.postSchedule(res,user_id);
    console.log(success);
    return res;
  }

  @Get('GetToDoList/:id')
  async getToDoList(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.GetToDoList(user_id);
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
        constraints: tasksArray[task]['constraints']

      };
      tasks.push(schedule_task);


    }

    return this.tasksService.postTasks(tasks);



  }

  // @Post('TaskForToDoList/:createTaskDto')
  // createTask(@Body() createTaskDto: CreateTaskDto) {
  //   return this.tasksService.postTaskForToDoList(createTaskDto);
  // }


  // Scheduled tasks:
  @Get('GetSchedule/:id')
  async getSchedule(@Param('id') user_id: string): Promise<Array<number>> {
    const result = await this.tasksService.getSchedule(user_id);
    const schedule_array = new Array<number>(337);
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


  //Categories shit
  @Get('GetUserCategories/:id')
  async getUserCategories(@Param('id') user_id: string): Promise<Array<number>> {
    return this.tasksService.getUserCategories(user_id);
  }

  @Get('GetUserCategorySlots/:id')
  async getUserCategorySlots(@Param('id') user_id: string): Promise<Array<number>> {
    const result = await this.tasksService.getUserCategorySlots(user_id);
    // console.log(result)
    const category_slots_array = new Array<number>(337);
    category_slots_array.fill(-1)

    for (const slot in result){
      category_slots_array[result[slot]['slot_id']]   = result[slot]['category_id']
    }
    return category_slots_array;
  }

  @Post('PostCategories/:user_id')
  postCategories(@Body() categorySlots: Array<number>, @Param('user_id')user_id:string) {
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
    return this.tasksService.postCategories(categories);
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



  // TODO endpoints:
  //2. UpdateUser
  //3 deleteUser
  //5 add Task
  //7 delete task
  //8 delete tasks?
  //9 .
}
