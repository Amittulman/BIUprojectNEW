import { Body, Controller, Delete, Get, Param, Post } from "@nestjs/common";
import {TasksService} from "./tasks.service";
import {CreateTaskDto} from "../Dto\'s/createTask.dto";
import {ToDoList} from "../interfaces/todo.interface";
import {ScheduledTask} from "../interfaces/scheduledTask.interface";
import {CreateToDoListDto} from "../Dto's/createToDoList.dto";
import {SchedulerService} from "../scheduler/scheduler.service";
import {CreateScheduledTaskDto} from "../Dto's/createScheduledTask.dto";

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

  @Post('TaskForToDoList/:createTaskDto')
  postTask(@Body() createTaskDto: CreateTaskDto) {
    return this.tasksService.postTask(createTaskDto); //TODO check DTO enforce
  }

  @Get('trig/:id')
  async trig(@Param('id') user_id: string): Promise<void> {
    const tdl = await this.tasksService.GetToDoList(user_id);
    //const categorySlots = await  this. tasksService.getCategorySlots(user_id);
    const categorySlots = [1,1,1,1];
    const res = await this.schedulerService.tryCalc(tdl,categorySlots);
    //change slots to scheduledTask
    //post slots to DB
    console.log(res);
  }

  @Get('GetToDoList/:id')
  async getToDoList(@Param('id') user_id: string): Promise<ToDoList> {
    return await this.tasksService.GetToDoList(user_id);
  }

  @Post('PostToDoList/:createToDoListDto')
  createToDoList(@Body() createToDoListDto: CreateToDoListDto) {
    return this.tasksService.postToDoList(createToDoListDto);
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
    const schedule:Array<ScheduledTask> = [];
    for(const task in tasksArray){
      if (tasksArray[task] != -1){
          const schedule_task:ScheduledTask = {
            task_id: tasksArray[task],
            user_id : parseInt(user_id),
            slot_id : parseInt(task)
          };
          schedule.push(schedule_task);

      }
    }
    return this.tasksService.postSchedule(schedule);
  }
  @Post('UpdateSchedule/:id/:slot')
  updateScheduleSlot(@Body() slot: CreateScheduledTaskDto) {
    console.log(slot)
    return this.tasksService.updateScheduleSlot(slot);
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





  // TODO endpoints:
  //2. UpdateUser
  //3 deleteUser
  //5 add Task
  //7 delete task
  //8 delete tasks?
  //9 .
}
