import { Injectable } from '@nestjs/common';
import {Task} from "../interfaces/task.interface";

@Injectable()
export class SchedulerService {
    constructor() {
        //this.tryCalc();
    }

    async tryCalc(ToDoList) {
        //var slots = Array(7).fill(0); //2 weeks (14X24X2) - slots of 30 min

        /*const temp_task1: Task = {
        task_id: 10,
        user_id: 11,
        title: 'first task',
        duration: 60, // 2 slots
        priority: 1,
        categoryID: 3,
        constraints: 'nothing'
        }
        const temp_task2: Task = {
        task_id: 11,
        user_id: 11,
        title: 'second task',
        duration: 120, // 4 slots
        priority: 0,
        categoryID: 3,
        constraints: 'nothing'
        }
        const temp_task3: Task = {
        task_id: 12,
        user_id: 11,
        title: 'third task',
        duration: 30, // 1 slot
        priority: 2,
        categoryID: 3,
        constraints: 'nothing'
        }*/
        //const tasksArray = new Array<Task>(temp_task1, temp_task2, temp_task3);
        const tasksArray1 = ToDoList.tasks;
        console.log(tasksArray1);
        const prioritiesTasks =  this.sortPriorities(tasksArray1);
        const resultCalc = await this.calcBackTracking(prioritiesTasks);
        console.log(resultCalc);
        return resultCalc;
    }

    sortPriorities(user_tasks: Array<Task>): Array<Task>[] {
        var pin_tasks = new  Array<Task>();
        var highPriority_tasks = new  Array<Task>();
        var midPriority_tasks = new  Array<Task>();
        var lowPriority_tasks = new  Array<Task>();
        var allTasks = new  Array<Task>();

        for (let task of user_tasks) {
            if(task.priority == 0) {
                pin_tasks.push(task);
            }
            else if(task.priority == 1) {
                highPriority_tasks.push(task);
            }
            else if(task.priority == 2) {
                midPriority_tasks.push(task);
            }
            else {
                lowPriority_tasks.push(task);
            }
        }
        return new Array<Array<Task>>(pin_tasks, highPriority_tasks, midPriority_tasks, lowPriority_tasks);
    }

    async calcBackTracking(tasks: Array<Array<Task>>): Promise<any> {
        //var slots = Array(672).fill(0); //2 weeks (14X24X2) - slots of 30 min
        var slots = Array(999).fill(0); //2 weeks (14X24X2) - slots of 30 min

        for(let currPriorityTasks of tasks) {
            if (await this.solveScedule(currPriorityTasks, slots) == false) {
                console.log("Full Solution does not exist");
                return false;
            }
        }

        // TODO save solution to DB
        return slots;
    }

    async solveScedule(tasks: Array<Task>, slots: any): Promise<boolean> {
        if (tasks.length == 0) { // success
            return true;
        }
        for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const tempTask = tasks[taskIndex];
            const spotsForThisTask = await this.findSpotsForThisTask(tempTask, slots);
            var isfull = await this.slotsIsFull(slots);
            if(isfull) {
/*
                if(!spotsForThisTask.length) {
                    return true;
                }
                continue;*/
                return false;
            }
            for (var spotIndex = 0; spotIndex < spotsForThisTask.length; spotIndex++) {
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
        const numOfSlots = task.duration/30; // calc how many slots the task needs
        let start = 0; // pointer to the end of the sliding window
        let end = 0; // pointer to the start of the sliding window
        var spots = []; // the result - all the options
        let currSlot = [];
        while (end <= slots.length){
            if (slots[end] === 0) { // this slot is empty
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

    async canScedualeHere(task:Array<Task> , index: number, slots: any) {
        return slots[index] == 0;
    }

    private async locateTask(spots: any, taskID: any, slots: any) {
        for (var slotNum of spots) {
            slots[slotNum] = taskID;
        }
        //console.log(slots);
        return slots;
    }

    private async removeFromThisSpot(slotsToReset: any, slots: any) {
        for (var slotNum of slotsToReset) {
            slots[slotNum] = 0;
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
        for(var slotIndex = 0; slotIndex < slots.length; slotIndex++) {
            if(slots[slotIndex] == 0) {
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
}