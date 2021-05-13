import {Injectable} from '@nestjs/common';
import {Task} from "../interfaces/task.interface";

const SLOTS_SIZE = 336;

@Injectable()
export class SchedulerService {
    constructor() {
        //this.tryCalc();
    }

    async tryCalc(ToDoList, categorySlots) {
        //create tasks for testing
        //var temptaskss = await this.createTempTasks();
        const slots = await this.createSlotsWithCategory(categorySlots);
        const mockTasks = await this.createTempTasks();
        //tasks from frontend
        const tasksFromUser = ToDoList.tasks;
        const prioritiesTasks =  await this.sortPriorities(tasksFromUser);
        const resultCalc = await this.calcBackTracking(prioritiesTasks, slots);
        const resultsOnlySlots = await this.createSlotsFromResult(resultCalc);
        return resultsOnlySlots;
    }

    async sortPriorities(user_tasks: Array<Task>): Promise<Array<Task>[]> {
        const pin_tasks = new  Array<Task>();
        const highPriority_tasks = new  Array<Task>();
        const midPriority_tasks = new  Array<Task>();
        const lowPriority_tasks = new  Array<Task>();
        const NonePriority_tasks = new  Array<Task>();
        const allTasks = new  Array<Task>();

        for (const task of user_tasks) {
            if(task.priority == 0) {
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
                pin_tasks.push(task);
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

        const constraint = await this.slotToConstraint(index);
        const day = constraint[0];
        let hour = constraint[1];
        if (hour === 3) {
            hour = 2;
        }
        // console.log("task:" + task);
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

    private createSlotsWithCategory(categorySlots: Array<number>) {
        const slotsAndCatagory = Array(SLOTS_SIZE);
        for(let i = 0;i<slotsAndCatagory.length;i++) {
            slotsAndCatagory[i] = [-1, 1]
        }

        for (let i = 0; i < categorySlots.length; i++) {
            slotsAndCatagory[i] = [-1, categorySlots[i]];
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
            priority: 1, category_id: 1,
            constraints: [[1,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
            // constraints: '010000000000000110100'
        }
        const temp_task2: Task = {
            task_id: 2,
            user_id: 1, task_title: 'second task',
            duration: 90,
            priority: 2, category_id: 1,
            constraints: [[0,1,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]]
        }
        const temp_task3: Task = {
            task_id: 3,
            user_id: 1, task_title: 'third task',
            duration: 120,
            priority: 1, category_id: 1,
            constraints: null
        }
        const temp_task4: Task = {
            task_id: 4,
            user_id: 1, task_title: 'third task',
            duration: 320,
            priority: 0, category_id: 1,
            constraints: null
        }
        const temp_task5: Task = {
            task_id: 5,
            user_id: 1, task_title: 'third task',
            duration: 4990,
            priority: 0, category_id: 1,
            constraints: null
        }
        return new Array<Task>(temp_task1, temp_task2);
    }

    private async slotToConstraint(slot: any) {
        let day = Math.floor(slot/48);
        // const sheerit = day-Math.floor(day);
        // if (sheerit<0.25 && Math.floor(day)>0){
        //     day--;
        // }
        const toMinus = day*48;
        const temp = slot-toMinus;
        const partOfTheDay = Math.floor(temp/12);


        return [day, partOfTheDay];

    }
}