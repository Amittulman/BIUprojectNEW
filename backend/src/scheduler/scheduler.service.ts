import {Injectable} from '@nestjs/common';
import {Task} from "../interfaces/task.interface";

const SLOTS_SIZE = 336;

@Injectable()
export class SchedulerService {
    constructor() {
        //this.tryCalc();
    }

    async tryCalc(ToDoList, categorySlots, current_time_slot) {
        //create tasks for testing
        //var temptaskss = await this.createTempTasks();
        const slots = await this.createSlotsWithCategory(categorySlots, current_time_slot);
        const mockTasks = await this.createTempTasks();
        const tasksFromUser = ToDoList.tasks;

        const taskWithRec = await this.createTaskWithDup(tasksFromUser);
        //tasks from frontend
        const prioritiesTasks =  await this.sortPriorities(taskWithRec);
        const slotsAfterPinned = await this.putPinnedTasks(prioritiesTasks[0], slots);
        const tasksWithPriorities = [prioritiesTasks[1],prioritiesTasks[2],prioritiesTasks[3]];
        const resultCalc = await this.calcBackTracking(tasksWithPriorities, slotsAfterPinned);
        const resultsOnlySlots = await this.createSlotsFromResult(resultCalc);
        console.log(resultsOnlySlots);
        const result = await this.removeTimeStampSlots(resultsOnlySlots, current_time_slot);
        return result;
    }

    async sortPriorities(user_tasks: Array<Task>): Promise<Array<Task>[]> {
        const pin_tasks = new  Array<Task>();
        const highPriority_tasks = new  Array<Task>();
        const midPriority_tasks = new  Array<Task>();
        const lowPriority_tasks = new  Array<Task>();
        const NonePriority_tasks = new  Array<Task>();
        const allTasks = new  Array<Task>();

        for (const task of user_tasks) {
            if (task.pinned_slot != null) {
                pin_tasks.push(task);
            }
            else if(task.priority == 0) {
                midPriority_tasks.push(task);
            }
            else if(task.priority == 3) {
                highPriority_tasks.push(task);
            }
            else if(task.priority == 2) {
                midPriority_tasks.push(task);
            }
            else if(task.priority == 1) {
                lowPriority_tasks.push(task);
            }
            else {
                lowPriority_tasks.push(task);
            }
        }
        return new Array<Array<Task>>(pin_tasks, highPriority_tasks, midPriority_tasks, lowPriority_tasks);
    }

    async calcBackTracking(tasks: Array<Array<Task>>, slots: any): Promise<any> {
        //var slots = Array(999).fill(0); //2 weeks (14X24X2) - slots of 30 min

        for(const currPriorityTasks of tasks) {
            if (await this.solveScedule(currPriorityTasks, slots) == false) {
                console.log("Full Solution does not exist");
                return null;
            }
        }

        // TODO save solution to DB
        return slots;
    }

    async solveScedule(tasks: Array<Task>, slots: any): Promise<boolean> {
        if (tasks.length == 0) { // success
            return true;
        }
        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const tempTask = tasks[taskIndex];
            const spotsForThisTask = await this.findSpotsForThisTask(tempTask, slots);
            const isfull = await this.slotsIsFull(slots);
            if(isfull) {
                return false;
            }
            for (let spotIndex = 0; spotIndex < spotsForThisTask.length; spotIndex++) {
                slots = await this.locateTask(spotsForThisTask[spotIndex], tempTask.task_id, slots);
                //this.logForDebug(tempTask, tasks, slots, spotsForThisTask,spotIndex);
                tasks = await this.removeTask(tasks, taskIndex);
                if (await this.solveScedule(tasks, slots)) {  //backtracking
                    return true;
                }
                slots = await this.removeFromThisSpot(spotsForThisTask[spotIndex], slots);
                tasks.splice(taskIndex,0, tempTask)
            }
        }
        return false;
    }

    // find all the options for put the task.
    private async findSpotsForThisTask(task: Task, slots: any) {
        const numOfSlots = Math.ceil(task.duration/30); // calc how many slots the task needs
        let start = 0; // pointer to the end of the sliding window
        let end = 0; // pointer to the start of the sliding window
        const spots = []; // the result - all the options
        let currSlot = [];
        while (end < slots.length){
            if (await this.canScheduleHere(task, end, slots)) { // this slot is empty
                currSlot.push(end); // we can use this slot
                if (currSlot.length === numOfSlots) { // check if the current slot is valid to be an answer
                    const CopyForPushCurrSlot  = Object.assign([], currSlot);
                    spots.push(CopyForPushCurrSlot);
                    start +=1 ; // after we have an answer we can move to the next window
                    currSlot.splice(0, 1); // delete first slot
                }
            } else {
                start = end+1;
                currSlot = [];
            }
            end += 1;
        }
        return spots;
    }

    async canScheduleHere(task:Task , index: number, slots: any) {
        const isEmpty = (slots[index][0] === -1);
        if(slots[index] === undefined || slots[index][1] === undefined){
            console.log('slots[index] ' + slots[index]+", index:"+ index);
            console.log('slots[index][1] ' + slots[index][1]);
        }
        const isRightCategory = (task.category_id === slots[index][1]);
        if(index < 12) {
            return false;
        }
        const constraint = await this.slotToConstraint(index);
        const day = constraint[0];
        let hour = constraint[1];
        if (hour === 3) {
            hour = 2;
        }
        if (task.recurrings > 1) {
            const isInThisDayAlready =  await this.checkIfSameTaskThisDay(task, day, slots);
            if (isInThisDayAlready) {
                return false;
            }
        }
        if(task === undefined || task.constraints === undefined || task.constraints[day] === undefined || task.constraints[day][hour] === undefined ){
            console.log('Hi!');
            console.log('task ' + task);
            console.log(' task.constraints ' +  task.constraints);
            console.log('task.constraints[day] ' + day);
            console.log('task.constraints[day][hour] ' + day + ', hour:'+hour);

        }
        const isOkbyConstaint = (task.constraints[day][hour] === 1);
        return (isEmpty && isRightCategory && isOkbyConstaint);
    }

    private async locateTask(spots: any, taskID: any, slots: any) {
        for (const slotNum of spots) {
            slots[slotNum][0] = taskID;
        }
        return slots;
    }

    private async removeFromThisSpot(slotsToReset: any, slots: any) {
        for (const slotNum of slotsToReset) { // TODO : ask from db the categories
            slots[slotNum] = [-1,-1];
        }
        return slots;
    }

    private async removeTask(tasks: Array<Task>, taskIndex: number) {
        const indexOfItem = tasks.indexOf(tasks[taskIndex], 0);
        if (indexOfItem > -1) {
            tasks.splice(indexOfItem, 1); //delete this task for tasks
        }
        return tasks;
    }

    private async slotsIsFull(slots: any) {
        for(let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
            if(slots[slotIndex][0] == -1) {
                return false;
            }
        }
        return true;
    }

    private logForDebug(tempTask: Task, tasks: Array<Task>, slots: any, spotsForThisTask: any[], spotIndex: number) {
        console.log('------------------------ task:');
        console.log(tempTask);
        console.log('------------------------ tasks:');
        console.log(tasks);
        console.log('------------------------ task:');
        console.log('------------------------ slots:');
        console.log(slots);
        console.log('------------------------ spotsForThisTask:');
        console.log(spotsForThisTask);
        console.log('------------------------ spotsForThisTask[spotIndex]:');
        console.log(spotsForThisTask[spotIndex]);
    }

    private createSlotsWithCategory(categorySlots: Array<number>, current_time_slot: number) {
        const slotsAndCatagory = Array(SLOTS_SIZE);
        for(let i = 0;i<slotsAndCatagory.length;i++) {
            slotsAndCatagory[i] = [-1, 1]
        }

        for (let i = 0; i < categorySlots.length; i++) {
            slotsAndCatagory[i] = [-1, categorySlots[i]];
        }

        for(let j = 0; j <= current_time_slot; j++) {
            slotsAndCatagory[j][0] = -999;
        }
        return slotsAndCatagory;
    }

    private async createSlotsFromResult(resultCalc: any) {
        if (resultCalc === null) {
            return null;
        }
        const slots = Array(SLOTS_SIZE);
        for (let i = 0; i < resultCalc.length; i++) {
            slots[i] = resultCalc[i][0];
        }
        return slots;
    }

     private async createTempTasks() {
         const temp_task1: Task = {
             task_id: 1333,
             user_id: 1, task_title: 'first task',
             duration: 90,
             priority: 1, category_id: -1,
             recurrings: 1,
             constraints: [[1,0,1],[0,0,0],[1,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
             pinned_slot: 30
         }
         const temp_task2: Task = {
             task_id: 2,
             user_id: 1, task_title: 'second task',
             duration: 90,
             priority: 2, category_id: -1,
             constraints: [[0,0,0],[1,1,1],[1,1,1],[1,1,1],[0,0,0],[0,0,0],[0,0,0]],
             recurrings: 1,
             pinned_slot: 10
         }
         const temp_task3: Task = {
             task_id: 3,
             user_id: 1, task_title: 'third task',
             duration: 120,
             priority: 1, category_id: 1,
             constraints: null,
             recurrings: 1,
             pinned_slot: null

         }
         const temp_task4: Task = {
             task_id: 4,
             user_id: 1, task_title: 'third task',
             duration: 320,
             priority: 0, category_id: 1,
             constraints: null,
             recurrings: 1,
             pinned_slot: 40
         }
         const temp_task5: Task = {
             task_id: 5,
             user_id: 1, task_title: 'third task',
             duration: 4990,
             priority: 0, category_id: 1,
             constraints: null,
             recurrings: 1,
             pinned_slot: 100
         }
         return new Array<Task>(temp_task1, temp_task2,temp_task3);
    }


    // sun: 12 - 60
    // mon: 60 -108
    // Tu: 108-156
    // Wen: 156-204
    // Th: 204-252
    // Fr: 252 su:300 - 336
    private async slotToConstraint(slot: any) {
        slot = slot-12;
        const day = Math.floor(slot/48);
        const toMinus = day*48;
        const temp = slot-toMinus;
        const partOfTheDay = Math.floor(temp/12);
        if (day < 0) {
            return [0,0];
        }
        return [day, partOfTheDay];
    }

    private async createTaskWithDup(tasks: any)
    {
        const newTasks = [];
        for (let i = 0; i < tasks.length; i++) {
            const rec = tasks[i].recurrings;
            for(let j = 0; j < rec; j++) {
                const objShallowCopy = Object.assign({}, tasks[i]);
                newTasks.push(objShallowCopy);
            }
        }
        return newTasks;
    }

    private async checkIfSameTaskThisDay(task:Task , day: number, slots: any) {
        const temp = day*48;
        const down = 12 + temp;
        let up = down + 48;
        if(up === 348) {
            up = 336;
        }
        for(let i=down; i< up; i++) {
            if(slots[i][0] === task.task_id) {
                return true;
            }
        }
        return false;
    }

    private async putPinnedTasks(pinnedTasks: Array<Task>, slots: any) {
        for (const task of pinnedTasks) {
            const numOfSlots = Math.ceil(task.duration/30); // calc how many slots the task needs
            for(let i=task.pinned_slot; i < task.pinned_slot + numOfSlots; i++) {
                slots[i][0] = task.task_id;
            }
        }
        return slots;
    }

    private async removeTimeStampSlots(resultsOnlySlots: any[], current_time_slot:number) {
        for(let j = 0; j <= current_time_slot; j++) {
            resultsOnlySlots[j] = -1;
        }
        return resultsOnlySlots;
    }
}