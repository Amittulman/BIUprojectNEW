import {Injectable} from '@nestjs/common';
import {Task} from "../interfaces/task.interface";

const SLOTS_SIZE = 336;

@Injectable()
export class SchedulerService {
    constructor() {
        //this.tryCalc();
    }

    async tryCalc(ToDoList, category_slots, current_time_slot) {
        const slots = SchedulerService.createSlotsWithCategory(category_slots, current_time_slot);
        const mockTasks = await SchedulerService.createTempTasks(); // Create mock tasks for testing
        const tasksFromUser = ToDoList.tasks;
        const taskWithRec = await SchedulerService.createTaskWithDup(tasksFromUser); // if there are tasks with recurring > 1 : we duplicate them
        const prioritiesTasks = await this.sortPriorities(taskWithRec);  // separate the tasks by priority
        const slotsAfterPinned = await SchedulerService.putPinnedTasks(prioritiesTasks[0], slots); // first, we pinned tasks
        const resultCalc = await this.calcBackTracking(prioritiesTasks[1], slotsAfterPinned);
        if(resultCalc == null) { // if there is no solution , no need to convert the slot back
            return null;
        }
        const resultsOnlySlots = await SchedulerService.createSlotsFromResult(resultCalc); // remove categories from result
        return await SchedulerService.removeTimeStampSlots(resultsOnlySlots, current_time_slot);
    }

    // take all tasks and separate them to priorities
    async sortPriorities(user_tasks: Array<Task>): Promise<Array<any>> {
        const pin_tasks = new  Array<Task>();
        const highPriority_tasks = new Array<Task>();
        const midPriority_tasks = new Array<Task>();
        const lowPriority_tasks = new Array<Task>();

        for (const task of user_tasks) {
            if (task.pinned_slot != null) {
                pin_tasks.push(task);
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
                midPriority_tasks.push(task);
            }
        }
        const priorityLists = [highPriority_tasks, midPriority_tasks, lowPriority_tasks]
        return [pin_tasks, priorityLists];
    }

    // algorithm is running for each priority list separately
    async calcBackTracking(tasks: Array<Array<Task>>, slots: any): Promise<any> {
        for(const currPriorityTasks of tasks) {
            if (await this.solveScedule(currPriorityTasks, slots) == false) {
                console.log("Full Solution does not exist");
                return null;
            }
        }
        return slots;
    }

    // backtracking algorithm
    async solveScedule(tasks: Array<Task>, slots: any): Promise<boolean> {
        if (tasks.length == 0) { // success - no more tasks
            return true;
        }
        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) { // loop over tasks and try to locate each
            const tempTask = tasks[taskIndex];
            const spotsForThisTask = await this.findSpotsForThisTask(tempTask, slots);
            const isfull = await SchedulerService.slotsIsFull(slots);
            if(isfull) {
                return false;
            }
            for (let spotIndex = 0; spotIndex < spotsForThisTask.length; spotIndex++) {
                slots = await SchedulerService.locateTask(spotsForThisTask[spotIndex], tempTask.task_id, slots);
                tasks = await SchedulerService.removeTask(tasks, taskIndex);
                if (await this.solveScedule(tasks, slots)) {  //backtracking
                    return true;
                }
                slots = await SchedulerService.removeFromThisSpot(spotsForThisTask[spotIndex], slots);
                tasks.splice(taskIndex,0, tempTask) // add the task back to the list
            }
        }
        return false;
    }

    // find all the options to put this task.
    private async findSpotsForThisTask(task: Task, slots: any) {
        const numOfSlotsNeeded = Math.ceil(task.duration/30); // calc how many slots this task needs
        let start = 0; // pointer to the start of the sliding window
        let end = 0; // pointer to the end of the sliding window
        const spots = []; // the result - all the options to locate this task
        let currSlot = [];
        while (end < slots.length){
            if (await this.canScheduleHere(task, end, slots)) { // this slot compatible
                currSlot.push(end);
                if (currSlot.length === numOfSlotsNeeded) { // check if the current slot is valid to be an answer
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

    // check if the task compatible to be in this slot (constraints + empty + category)
    async canScheduleHere(task:Task , slot: number, slots: any) {
        const slotIsEmpty = (slots[slot][0] === -1);
        const isRightCategory = (task.category_id === slots[slot][1]);

        if(slot < 12) { // the first 12 slots belong to Saturday night
            return false;
        }

        const constraint = await SchedulerService.slotToConstraint(slot);
        const day = constraint[0];
        let hour = constraint[1];
        if (hour === 3) { // we want the next morning will be this night (example - 4:00)
            hour = 2;
        }
        if (task.recurrings > 1) { // dont want the same task will be twice in the same day
            const isInThisDayAlready =  await SchedulerService.checkIfSameTaskThisDay(task, day, slots);
            if (isInThisDayAlready) {
                return false;
            }
        }
        const isOkbyConstraint = (task.constraints[day][hour] === 1);
        return (slotIsEmpty && isRightCategory && isOkbyConstraint);
    }

    // locate the task in the slots array - put the task ID
    private static async locateTask(spots: any, taskID: any, slots: any) {
        for (const slotNum of spots) {
            slots[slotNum][0] = taskID;
        }
        return slots;
    }

    // if there is no answer - clear the slots from this task ID
    private static async removeFromThisSpot(slotsToReset: any, slots: any) {
        for (const slotNum of slotsToReset) {
            slots[slotNum][0] = [-1];
        }
        return slots;
    }

    // remove task from list of tasks after locating
    private static async removeTask(tasks: Array<Task>, taskIndex: number) {
        const indexOfItem = tasks.indexOf(tasks[taskIndex], 0);
        if (indexOfItem > -1) {
            tasks.splice(indexOfItem, 1); //delete this task for tasks
        }
        return tasks;
    }

    // check if schedule is full
    private static async slotsIsFull(slots: any) {
        for(let slotIndex = 0; slotIndex < slots.length; slotIndex++) {
            if(slots[slotIndex][0] == -1) {
                return false;
            }
        }
        return true;
    }

    //
    private static createSlotsWithCategory(categorySlots: Array<number>, current_time_slot: number) {
        const slots_and_catagory = Array(SLOTS_SIZE);

/*
        for(let i = 0;i<slots_and_catagory.length;i++) {
            slots_and_catagory[i] = [-1, 1]
        }
*/

        // initialize the slots to be [empty, category[
        for (let i = 0; i < categorySlots.length; i++) {
            slots_and_catagory[i] = [-1, categorySlots[i]];
        }

        // block all the slots until now
        for(let j = 0; j <= current_time_slot; j++) {
            slots_and_catagory[j][0] = -999;
        }
        return slots_and_catagory;
    }

    // remove the categories. return only the slots to be the algorithm result
    private static async createSlotsFromResult(resultCalc: any) {
        const slots = Array(SLOTS_SIZE);
        for (let i = 0; i < resultCalc.length; i++) {
            slots[i] = resultCalc[i][0];
        }
        return slots;
    }

    //this function used to be for manual tests
    private static async createTempTasks() : Promise<Array<Task>> {
         const task1: Task = {
             task_id: 1333,
             user_id: 1, task_title: 'first task',
             duration: 90,
             priority: 1, category_id: -1,
             recurrings: 1,
             constraints: [[1,0,1],[0,0,0],[1,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]],
             pinned_slot: 30
         }
         const task2: Task = {
             task_id: 2,
             user_id: 1, task_title: 'second task',
             duration: 90,
             priority: 2, category_id: -1,
             constraints: [[0,0,0],[1,1,1],[1,1,1],[1,1,1],[0,0,0],[0,0,0],[0,0,0]],
             recurrings: 1,
             pinned_slot: 10
         }
         const task3: Task = {
             task_id: 3,
             user_id: 1, task_title: 'third task',
             duration: 120,
             priority: 1, category_id: 1,
             constraints: null,
             recurrings: 1,
             pinned_slot: null

         }
         const task4: Task = {
             task_id: 4,
             user_id: 1, task_title: 'third task',
             duration: 320,
             priority: 0, category_id: 1,
             constraints: null,
             recurrings: 1,
             pinned_slot: 40
         }
         const task5: Task = {
             task_id: 5,
             user_id: 1, task_title: 'third task',
             duration: 4990,
             priority: 0, category_id: 1,
             constraints: null,
             recurrings: 1,
             pinned_slot: 100
         }
         return new Array<Task>(task1, task2,task3);
    }

    // sun: 12 - 60
    // mon: 60 -108
    // Tu: 108-156
    // Wen: 156-204
    // Th: 204-252
    // Fr: 252 su:300 - 336
    private static async slotToConstraint(slot: any) {
        slot = slot-12; // 12 first slots belong to Saturday night
        const day = Math.floor(slot/48);
        const toMinus = day*48;
        const temp = slot-toMinus;
        const partOfTheDay = Math.floor(temp/12);
        if (day < 0) {
            return [0,0];
        }
        return [day, partOfTheDay];
    }

    // tasks with recurring > 1 we want to duplicate
    private static async createTaskWithDup(tasks: any) {
        const taskWithDuplicate = [];
        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const recForThisTask = tasks[taskIndex].recurrings;
            for(let j = 0; j < recForThisTask; j++) {
                const copyTask = Object.assign({}, tasks[taskIndex]);
                taskWithDuplicate.push(copyTask);
            }
        }
        return taskWithDuplicate;
    }

    // the algorithm doesn't locate same task in the same day
    private static async checkIfSameTaskThisDay(task:Task , day: number, slots: any) {
        const firstSlotForToday = day*48;
        let downMargin = 12 + firstSlotForToday; // there is a gap for 12 slots
        let upMargin = downMargin + 48;
        if(upMargin === 348) { // there is a gap for 12 slots
            upMargin = 336;
        }
        if(downMargin === 300) { // there is a gap for 12 slots
            downMargin = 288;
        }
        for(let i=downMargin; i< upMargin; i++) { // check if there is task with the same ID in the same day
            if(slots[i][0] === task.task_id) {
                return true;
            }
        }
        return false;
    }

    // locate the pin tasks outside of the algorithm
    private static async putPinnedTasks(pinnedTasks: Array<Task>, slots: any) {
        for (const task of pinnedTasks) {
            const numOfSlots = Math.ceil(task.duration/30); // calc how many slots the task needs
            for(let i=task.pinned_slot; i < task.pinned_slot + numOfSlots; i++) {
                slots[i][0] = task.task_id;
            }
        }
        return slots;
    }

    // at the end we want to clear the slots array from blocking number we put for timestamp
    private static async removeTimeStampSlots(resultsOnlySlots: any[], current_time_slot:number) {
        for(let j = 0; j <= current_time_slot; j++) {
            resultsOnlySlots[j] = -1;
        }
        return resultsOnlySlots;
    }

    async checkTasksErrors(tasks: Array<any>, timeStamp: number, userID : string, categories : Array<number>): Promise<any> {
        const day = Math.floor(timeStamp/48);
        const leftDays = 7-day;
        const problemTasks = [];

        for (let taskIndex = 0; taskIndex < tasks.length; taskIndex++) {
            const tempTask = tasks[taskIndex];
            const currentTaskRecurring = tempTask.recurrings;
            const currentTaskConstraint = tempTask.constraints;
            const numberOfSlotsTaskNeed = Math.ceil(tempTask.duration/30); // calc how many slots the task needs
            const numberOfSlotsTaskNeedAllWeek = numberOfSlotsTaskNeed*tempTask.recurrings
            const partOfTheDay = await this.convertSlotToPartOfDay(timeStamp);
            let constraintEnough = false;
            let CounterForDaysConstraints = 0;
            const tempErrorTask = [tempTask.task_id,0,0,0];
            let leftPointer = timeStamp;
            let rightPointer = timeStamp;
            let isCaregoriesEnough = false;
            let counterTodayConstraintsSlots = 0;
            let counterAllConstraintsSlotForCurTask = 0;

            if(currentTaskRecurring > leftDays) {
                //problem with this task - reccuringg
                tempErrorTask[1] = 1;
            }

            // check constraints and if there is 1 from current day to the end.
            for(let constraintIndex = day; constraintIndex < tempTask.constraints.length ; constraintIndex++) {
                const isMorningConstraint = currentTaskConstraint[constraintIndex][0] === 1;
                const isNoonConstraint = currentTaskConstraint[constraintIndex][1] === 1;
                const isNightConstraint = currentTaskConstraint[constraintIndex][2] === 1;

                if (constraintIndex === day) { // for today , check start only from timeStamp
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
                else { //check the rest of the days(not today)
                    if (isNoonConstraint || isNightConstraint || isMorningConstraint) {
                        constraintEnough = true;
                        CounterForDaysConstraints += 1;
                    }
                }
            }

            if(!constraintEnough || CounterForDaysConstraints < currentTaskRecurring) {
                //problem with this task - constraints
                tempErrorTask[2] = 1;
            }

            while (rightPointer < categories.length){
                if (tempTask.category_id === categories[rightPointer]) {
                    counterTodayConstraintsSlots += 1;
                    if (counterTodayConstraintsSlots === numberOfSlotsTaskNeed) {
                        let isConstraintForPartOfTheDayIsCompatible = await this.checkConstraintBySlot(rightPointer, tempTask);
                        if (!isConstraintForPartOfTheDayIsCompatible) {
                            tempErrorTask[2] = 1;
                        }
                        counterAllConstraintsSlotForCurTask += counterTodayConstraintsSlots;
                        if(counterAllConstraintsSlotForCurTask === numberOfSlotsTaskNeedAllWeek) {
                            isCaregoriesEnough = true;
                            break;
                        }
                        rightPointer = await this.jumpNextDay(rightPointer)
                        counterTodayConstraintsSlots = 0;
                    }
                } else {
                    leftPointer = rightPointer+1;
                    counterTodayConstraintsSlots = 0;
                }
                rightPointer += 1;
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
        return (day + 1) * 48;
    }

    async convertSlotToPartOfDay(curSlot: number): Promise<number> {
        curSlot = curSlot-12;
        const day = Math.floor(curSlot/48);
        const toMinus = day*48;
        const temp = curSlot-toMinus;
        let partOfTheDay = Math.floor(temp/12);
        if (partOfTheDay === 3) {
            partOfTheDay = 2;
        }
        return partOfTheDay;
    }

    private async checkConstraintBySlot(slot: number,tempTask : any) : Promise<boolean> {
        const day = Math.floor(slot/48);
        let partOftheDay = await this.convertSlotToPartOfDay(slot);
        let curConstraints = tempTask.constraints;
        return curConstraints[day][partOftheDay] === 1;
    }
}