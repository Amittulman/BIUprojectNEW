import { Injectable } from '@nestjs/common';
import {AppService} from "../app.service";
import {Task} from "../interfaces/task.interface";
import {retrieveCols} from "@nestjs/cli/actions";

@Injectable()
export class ScedualerService {
    constructor() {
        //this.tryCalc();
    }

    async tryCalc() {
        //var slots = Array(7).fill(0); //2 weeks (14X24X2) - slots of 30 min

        const temp_task1: Task = {
            taskID: 10,
            userId: 11,
            title: 'first task',
            duration: 60, // 2 slots
            priority: 1,
            categoryID: 3,
            constraints: 'nothing'
        }
        const temp_task2: Task = {
            taskID: 11,
            userId: 11,
            title: 'second task',
            duration: 120, // 4 slots
            priority: 0,
            categoryID: 3,
            constraints: 'nothing'
        }
        const temp_task3: Task = {
            taskID: 12,
            userId: 11,
            title: 'third task',
            duration: 30, // 1 slot
            priority: 2,
            categoryID: 3,
            constraints: 'nothing'
        }
        const tasksArray = new Array<Task>(temp_task1, temp_task2, temp_task3);
        this.sortPriorities(tasksArray);
        const resultCalc = await this.calcBackTracking(tasksArray);
        console.log(resultCalc);
        //console.log(slots);
    }

    sortPriorities(user_tasks: Array<Task>): void {
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
    }

    async calcBackTracking(tasks: Array<Task>): Promise<boolean> {
        //var slots = Array(672).fill(0); //2 weeks (14X24X2) - slots of 30 min
        var slots = Array(7).fill(0); //2 weeks (14X24X2) - slots of 30 min

        if (await this.solveScedule(tasks, slots) == false) {
            console.log("Full Solution does not exist");
            return false;
        }

        console.log(slots);

        // TODO save solution to DB
        return true;
    }

    async solveScedule(tasks: Array<Task>, slots: any): Promise<boolean> {
        //TODO remove index
        if (tasks.length == 0) { // success
            console.log(slots);
            return true;
        }
        for (var taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const tempTask = tasks[taskIndex];
            const spotsForThisTask = await this.findSpotsForThisTask(tempTask, slots); // TODO - implement
            if (!spotsForThisTask.length) { // there is no option for this task
                console.log('no place to this task: ' + tasks);
                continue;
            }
            for (var spotIndex = 0; spotIndex < spotsForThisTask.length; spotIndex++) {
                slots = await this.locateTask(spotsForThisTask[spotIndex], tempTask.taskID, slots);
                tasks = await this.removeTask(tasks, taskIndex);
                if (await this.solveScedule(tasks, slots)) {  //backtracking
                    return true;
                }
                slots = await this.removeFromThisSpot(spotsForThisTask[spotIndex], slots);
                tasks.push(tempTask);
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
        //console.log(spots);
        return spots;
    }

    async canScedualeHere(task:Array<Task> , index: number, slots: any) {
        return slots[index] == 0;
    }

    private async locateTask(spots: any, taskID: any, slots: any) {
        for (var slotNum of spots) {
            slots[slotNum] = taskID;
        }
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
}