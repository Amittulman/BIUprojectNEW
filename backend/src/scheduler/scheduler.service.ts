import {Injectable} from '@nestjs/common';
import {Task} from "../interfaces/task.interface";

const SLOTS_SIZE = 336;
const DEFAULT_EMPTY_SLOT = -1;
const PASSED_CATEGORY_VALUE = -999;
const FIRST_INDEX = 0;
const HIGH_PRIORITY = 3;
const MID_PRIORITY = 2;
const LOW_PRIORITY = 1;
const PRIORITY_LIST_TASKS_INDEX = 1;
const HALF_HOUR = 30;
const PIN_TASKS_INDEX = 0;
const SATURDAY_NIGHT_HOURS = 12;
const SLOTS_PER_DAY = 48;
const HOURS_PER_PART_Of_THE_DAY = 12;
const UP_MARGIN_LAST_DAY = 348;
const NEW_UP_MARGIN_LAST_DAY = 336;
const DOWN_MARGIN_LAST_DAY = 300;
const NEW_DOWN_MARGIN_LAST_DAY = 288;
const ZERO_TASKS = 0;
const SLOT_VAL_INDEX = 0;
const CATEGORY_VAL_INDEX = 1;
const DAY_INDEX = 0;
const PART_OF_THE_DAY_INDEX = 1;
const AFTER_MIDNIGHT = 3;
const NIGHT = 2;
const NOON = 1;
const MORNING = 0;
const VALID_CONSTRAINT = 1;
const DAYS_IN_WEEK = 7;
const ERROR_CONSTRAINTS_INDEX = 2;
const ERROR_RECCURING_INDEX = 1;
const ERROR_CATEGORIES_INDEX = 3;
const ZERO_COUNER = 0;
const ERROR = 1;


@Injectable()
export class SchedulerService {
    constructor() {
        //this.tryCalc();
    }

    async tryCalc(ToDoList, category_slots, current_time_slot) {
        const slots = SchedulerService.createSlotsWithCategory(category_slots, current_time_slot);
        const tasksFromUser = ToDoList.tasks;
        const taskWithRec = await SchedulerService.createTaskWithDup(tasksFromUser); // if there are tasks with recurring > 1 : we duplicate them
        const sortedPriorities = await this.sortPriorities(taskWithRec);  // separate the tasks by priority
        const slotsAfterPinned = await SchedulerService.putPinnedTasks(sortedPriorities[PIN_TASKS_INDEX], slots); // first, we pinned tasks
        const resultCalc = await this.calcBackTracking(sortedPriorities[PRIORITY_LIST_TASKS_INDEX], slotsAfterPinned);
        if(resultCalc == null) { // if there is no solution , no need to convert the slot back
            return null;
        }
        const resultsOnlySlots = await SchedulerService.createSlotsFromResult(resultCalc); // remove categories from result
        return await SchedulerService.removeTimeStampSlots(resultsOnlySlots, current_time_slot);
    }

    // take all tasks and separate them to priorities
    async sortPriorities(user_tasks: Array<Task>): Promise<[Array<Task>, Array<Array<Task>>]> {
        const pin_tasks = new  Array<Task>();
        const highPriority_tasks = new Array<Task>();
        const midPriority_tasks = new Array<Task>();
        const lowPriority_tasks = new Array<Task>();

        for (const task of user_tasks) {
            if (task.pinned_slot != null) {
                pin_tasks.push(task);
            }
            else if(task.priority == HIGH_PRIORITY) {
                highPriority_tasks.push(task);
            }
            else if(task.priority == MID_PRIORITY) {
                midPriority_tasks.push(task);
            }
            else if(task.priority == LOW_PRIORITY) {
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
    async calcBackTracking(tasks: Array<Array<Task>>, slots: Array<any>): Promise<Array<number>> {
        for(const currPriorityTasks of tasks) {
            if (await this.solveScedule(currPriorityTasks, slots) == false) {
                console.log("Full Solution does not exist");
                return null;
            }
        }
        return slots;
    }

    //  backtracking algorithm
    async solveScedule(tasks: Array<Task>, slots: Array<number>): Promise<boolean> {
        if (tasks.length == ZERO_TASKS) { // success - no more tasks
            return true;
        }
        for (let taskIndex = FIRST_INDEX; taskIndex < tasks.length; taskIndex++) { // loop over tasks and try to locate each
            const tempTask = tasks[taskIndex];
            const spotsForThisTask = await this.findSpotsForThisTask(tempTask, slots);
            const isfull = await SchedulerService.slotsIsFull(slots);
            if(isfull) {
                return false;
            }
            for (let spotIndex = FIRST_INDEX; spotIndex < spotsForThisTask.length; spotIndex++) {
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
    private async findSpotsForThisTask(task: Task, slots: Array<number>) : Promise<Array<Array<number>>> {
        const numOfSlotsNeeded = Math.ceil(task.duration/HALF_HOUR); // calc how many slots this task needs
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
                start = end + 1;
                currSlot = [];
            }
            end += 1;
        }
        return spots;
    }

    // check if the task compatible to be in this slot (constraints + empty + category)
    async canScheduleHere(task:Task , slot: number, slots: Array<number>) : Promise<boolean> {
        const slotIsEmpty = (slots[slot][SLOT_VAL_INDEX] === DEFAULT_EMPTY_SLOT);
        const isRightCategory = (task.category_id === slots[slot][CATEGORY_VAL_INDEX]);

        if(slot < SATURDAY_NIGHT_HOURS) { // the first 12 slots belong to Saturday night
            return false;
        }

        const constraint = await SchedulerService.slotToConstraint(slot);
        const day = constraint[DAY_INDEX];
        let hour = constraint[PART_OF_THE_DAY_INDEX];
        if (hour === AFTER_MIDNIGHT) { // we want the next morning will be this night (example - 4:00)
            hour = NIGHT;
        }
        if (task.recurrings > 1) { // dont want the same task will be twice in the same day
            const isInThisDayAlready =  await SchedulerService.checkIfSameTaskThisDay(task, day, slots);
            if (isInThisDayAlready) {
                return false;
            }
        }
        const isOkbyConstraint = (task.constraints[day][hour] === VALID_CONSTRAINT);
        return (slotIsEmpty && isRightCategory && isOkbyConstraint);
    }

    // locate the task in the slots array - put the task ID
    private static async locateTask(spots: Array<any>, taskID: number, slots: Array<any>) : Promise<Array<number>> {
        for (const slotNum of spots) {
            slots[slotNum][SLOT_VAL_INDEX] = taskID;
        }
        return slots;
    }

    // if there is no answer - clear the slots from this task ID
    private static async removeFromThisSpot(slotsToReset: any, slots: Array<number>) : Promise<Array<number>> {
        for (const slotNum of slotsToReset) {
            slots[slotNum][SLOT_VAL_INDEX] = [DEFAULT_EMPTY_SLOT];
        }
        return slots;
    }

    // remove task from list of tasks after locating
    private static async removeTask(tasks: Array<Task>, taskIndex: number) : Promise<Array<Task>>{
        const indexOfItem = tasks.indexOf(tasks[taskIndex], 0);
        if (indexOfItem > -1) {
            tasks.splice(indexOfItem, 1); //delete this task for tasks
        }
        return tasks;
    }

    // check if schedule is full
    private static async slotsIsFull(slots: Array<any>) : Promise<boolean> {
        for(let slotIndex = FIRST_INDEX; slotIndex < slots.length; slotIndex++) {
            if(slots[slotIndex][SLOT_VAL_INDEX] == DEFAULT_EMPTY_SLOT) {
                return false;
            }
        }
        return true;
    }

    //
    private static createSlotsWithCategory(categorySlots: Array<number>, current_time_slot: number) : Array<number> {
        const slots_and_catagory = Array(SLOTS_SIZE);

        // initialize the slots to be [empty, category[
        for (let i = FIRST_INDEX; i < categorySlots.length; i++) {
            slots_and_catagory[i] = [DEFAULT_EMPTY_SLOT, categorySlots[i]];
        }

        // block all the slots until now
        for(let j = FIRST_INDEX; j <= current_time_slot; j++) {
            slots_and_catagory[j][SLOT_VAL_INDEX] = -PASSED_CATEGORY_VALUE;
        }
        return slots_and_catagory;
    }

    // remove the categories. return only the slots to be the algorithm result
    private static async createSlotsFromResult(resultCalc: Array<any>) : Promise<Array<number>> {
        const slots = Array(SLOTS_SIZE);
        for (let i = FIRST_INDEX; i < resultCalc.length; i++) {
            slots[i] = resultCalc[i][SLOT_VAL_INDEX];
        }
        return slots;
    }

    // sun: 12 - 60
    // mon: 60 -108
    // Tu: 108-156
    // Wen: 156-204
    // Th: 204-252
    // Fr: 252 su:300 - 336
    private static async slotToConstraint(slot: number) : Promise<[number, number]> {
        slot = slot-SATURDAY_NIGHT_HOURS; // 12 first slots belong to Saturday night
        const day = Math.floor(slot/SLOTS_PER_DAY);
        const toMinus = day*SLOTS_PER_DAY;
        const temp = slot-toMinus;
        const partOfTheDay = Math.floor(temp/HOURS_PER_PART_Of_THE_DAY);
        if (day < 0) {
            return [0,0];
        }
        return [day, partOfTheDay];
    }

    // tasks with recurring > 1 we want to duplicate
    private static async createTaskWithDup(tasks: Array<Task>) : Promise<Array<Task>> {
        const taskWithDuplicate = [];
        for (let taskIndex = FIRST_INDEX; taskIndex < tasks.length; taskIndex++) {
            const recForThisTask = tasks[taskIndex].recurrings;
            for(let j = FIRST_INDEX; j < recForThisTask; j++) {
                const copyTask = Object.assign({}, tasks[taskIndex]);
                taskWithDuplicate.push(copyTask);
            }
        }
        return taskWithDuplicate;
    }

    // the algorithm doesn't locate same task in the same day
    private static async checkIfSameTaskThisDay(task:Task , day: number, slots: Array<number>) : Promise<boolean> {
        const firstSlotForToday = day*SLOTS_PER_DAY;
        let downMargin = SATURDAY_NIGHT_HOURS + firstSlotForToday; // there is a gap for 12 slots
        let upMargin = downMargin + SLOTS_PER_DAY;
        if(upMargin === UP_MARGIN_LAST_DAY) { // there is a gap for 12 slots
            upMargin = NEW_UP_MARGIN_LAST_DAY;
        }
        if(downMargin === DOWN_MARGIN_LAST_DAY) { // there is a gap for 12 slots
            downMargin = NEW_DOWN_MARGIN_LAST_DAY;
        }
        for(let i=downMargin; i< upMargin; i++) { // check if there is task with the same ID in the same day
            if(slots[i][SLOT_VAL_INDEX] === task.task_id) {
                return true;
            }
        }
        return false;
    }

    // locate the pin tasks outside of the algorithm
    private static async putPinnedTasks(pinnedTasks: Array<Task>, slots: Array<number>) : Promise<Array<number>> {
        for (const task of pinnedTasks) {
            const numOfSlots = Math.ceil(task.duration/HALF_HOUR); // calc how many slots the task needs
            for(let i=task.pinned_slot; i < task.pinned_slot + numOfSlots; i++) {
                slots[i][FIRST_INDEX] = task.task_id;
            }
        }
        return slots;
    }

    // at the end we want to clear the slots array from blocking number we put for timestamp
    private static async removeTimeStampSlots(resultsOnlySlots: Array<number>, current_time_slot:number) : Promise<Array<number>> {
        for(let j = FIRST_INDEX; j <= current_time_slot; j++) {
            resultsOnlySlots[j] = DEFAULT_EMPTY_SLOT;
        }
        return resultsOnlySlots;
    }

    // optimizations to the algorithm. we check before sending to calc backtracking, if can be problems with
    // recurring / constraints or categories
    public async checkTasksErrors(tasks: Array<any>, timeStamp: number, userID : string, categories : Array<number>): Promise<Array<any>> {
        const day = Math.floor(timeStamp/SLOTS_PER_DAY);
        const leftDays = DAYS_IN_WEEK - day;
        const problemTasks = [];

        let categoriesMap = await SchedulerService.createCategoriesMap(categories , timeStamp);
        let categoriesTaskCounterMap = await SchedulerService.createCategoriesTaskCounterMap();

        for (let taskIndex = FIRST_INDEX; taskIndex < tasks.length; taskIndex++) {
            const tempTask = tasks[taskIndex];
            const currentTaskRecurring = tempTask.recurrings;
            const currentTaskConstraint = tempTask.constraints;
            const numberOfSlotsTaskNeed = Math.ceil(tempTask.duration/HALF_HOUR); // calc how many slots the task needs
            const numberOfSlotsTaskNeedAllWeek = numberOfSlotsTaskNeed*tempTask.recurrings
            const partOfTheDay = await SchedulerService.convertSlotToPartOfDay(timeStamp);
            let constraintEnough = false;
            let CounterForDaysConstraints = ZERO_COUNER;
            const tempErrorTask = [tempTask.task_id,0,0,0];
            let leftPointer = timeStamp;
            let rightPointer = timeStamp;
            let isCaregoriesEnough = false;
            let counterTodayConstraintsSlots = ZERO_COUNER;
            let counterAllConstraintsSlotForCurTask = ZERO_COUNER;
            let constarintsWithCategoreiesByDaysAndParts = [[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0],[0,0,0]];
            let countDaysIsOkByConstraintsAndCategories = ZERO_COUNER;


            let newValueForCategoryTaskCounter = categoriesTaskCounterMap.get(tempTask.category_id) + numberOfSlotsTaskNeedAllWeek;
            categoriesTaskCounterMap.set(tempTask.category_id , newValueForCategoryTaskCounter);

            if(currentTaskRecurring > leftDays) {
                //problem with this task - reccuring
                tempErrorTask[ERROR_RECCURING_INDEX] = ERROR;
            }

            // check constraints and if there is 1 from current day to the end.
            for(let constraintIndex = day; constraintIndex < tempTask.constraints.length ; constraintIndex++) {
                const isMorningConstraint = currentTaskConstraint[constraintIndex][MORNING] === VALID_CONSTRAINT;
                const isNoonConstraint = currentTaskConstraint[constraintIndex][NOON] === VALID_CONSTRAINT;
                const isNightConstraint = currentTaskConstraint[constraintIndex][NIGHT] === VALID_CONSTRAINT;

                if (constraintIndex === day) { // for today , check start only from timeStamp
                    if (partOfTheDay === NIGHT) { // night now
                        if (isNightConstraint) {
                            constraintEnough = true;
                            CounterForDaysConstraints += 1;
                        }
                    } else if (partOfTheDay === NOON) { //noon now
                        if (isNoonConstraint || isNightConstraint) {
                            constraintEnough = true;
                            CounterForDaysConstraints += 1;
                        }
                    } else if (partOfTheDay === MORNING) { // morning now
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

            if(!constraintEnough || CounterForDaysConstraints < currentTaskRecurring) { //problem with constraints
                tempErrorTask[ERROR_CONSTRAINTS_INDEX] = ERROR;
            }

            while (rightPointer < categories.length){
                if (tempTask.category_id === categories[rightPointer]) {
                    counterTodayConstraintsSlots += 1;
                    if (counterTodayConstraintsSlots === numberOfSlotsTaskNeed) {
                        let isConstraintForPartOfTheDayIsCompatibletemp = await SchedulerService.checkConstraintBySlot(rightPointer, tempTask);
                        const day = Math.floor(rightPointer/48);
                        let partOftheDay = await SchedulerService.convertSlotToPartOfDay(rightPointer);
                        if (isConstraintForPartOfTheDayIsCompatibletemp) {
                            constarintsWithCategoreiesByDaysAndParts[day][partOftheDay] = 1;
                        }
                        counterAllConstraintsSlotForCurTask += counterTodayConstraintsSlots;
                        if(counterAllConstraintsSlotForCurTask === numberOfSlotsTaskNeedAllWeek) {
                            isCaregoriesEnough = true;
                            //break;
                        }
                        //rightPointer = await SchedulerService.jumpNextDay(rightPointer)
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
                tempErrorTask[ERROR_CATEGORIES_INDEX] = ERROR;
            }

            for (var dayIndex = FIRST_INDEX; dayIndex < constarintsWithCategoreiesByDaysAndParts.length; dayIndex++) {
                if(constarintsWithCategoreiesByDaysAndParts[dayIndex][MORNING] === VALID_CONSTRAINT || constarintsWithCategoreiesByDaysAndParts[dayIndex][NOON] === VALID_CONSTRAINT ||constarintsWithCategoreiesByDaysAndParts[dayIndex][NIGHT] === VALID_CONSTRAINT) {
                    countDaysIsOkByConstraintsAndCategories += 1 ;
                }
            }

            if (countDaysIsOkByConstraintsAndCategories < currentTaskRecurring) {
                tempErrorTask[ERROR_CONSTRAINTS_INDEX] = ERROR;
            }

            if(tempErrorTask[ERROR_RECCURING_INDEX] != 0 || tempErrorTask[ERROR_CONSTRAINTS_INDEX] != 0 || tempErrorTask[ERROR_CATEGORIES_INDEX] != 0) {
                if(tempErrorTask[ERROR_CONSTRAINTS_INDEX] === 1 && tempErrorTask[ERROR_CATEGORIES_INDEX] === 1) {
                    tempErrorTask[ERROR_CONSTRAINTS_INDEX] = 0;
                }
                problemTasks.push(tempErrorTask)
            }
        }

        let errorCategories = await SchedulerService.createErrorCategories(categoriesMap,categoriesTaskCounterMap);

        for(let indexErrorCategory = FIRST_INDEX; indexErrorCategory < errorCategories.length; indexErrorCategory ++) {
            let errorTaskWithThisCategory = await SchedulerService.FindTaskWithThisCategory(errorCategories[indexErrorCategory], tasks);
            problemTasks.push([errorTaskWithThisCategory.task_id,0,0,1]);
        }

        return problemTasks;
    }

    // get slot and jump from current day to the next
    private static async jumpNextDay(curSlot: number): Promise<number> {
        const day = Math.floor(curSlot/48);
        return (day + 1) * 48;
    }

    private static async convertSlotToPartOfDay(curSlot: number): Promise<number> {
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

    private static async checkConstraintBySlot(slot: number, tempTask : any) : Promise<boolean> {
        const day = Math.floor(slot/48);
        let partOftheDay = await SchedulerService.convertSlotToPartOfDay(slot);
        let curConstraints = tempTask.constraints;
        return curConstraints[day][partOftheDay] === 1;
    }

    private static async FindTaskWithThisCategory(categoryProblem: string, tasks: Array<Task>) {
        // find an appropriate task
        for(let indexTask = 0; indexTask < tasks.length; indexTask ++) {
            if(tasks[indexTask].category_id === Number(categoryProblem)) {
                return tasks[indexTask];
            }
        }
    }

    private static async createCategoriesMap(categories : Array<number>, timeStamp: number) {
        let categoriesMap = new Map();
        categoriesMap.set(-1, 0);
        categoriesMap.set(0, 0);
        categoriesMap.set(1, 0);
        categoriesMap.set(2, 0);
        categoriesMap.set(3, 0);
        categoriesMap.set(4, 0);
        categoriesMap.set(5, 0);

        for(let catIndex = timeStamp; catIndex < categories.length; catIndex++) {
            let category = categories[catIndex];
            let newValueForCategory = categoriesMap.get(category) + 1;
            categoriesMap.set(category , newValueForCategory);
        }

        return categoriesMap;
    }

    private static async createCategoriesTaskCounterMap() {
        let categoriesTaskCounterMap = new Map();
        categoriesTaskCounterMap.set(-1, 0);
        categoriesTaskCounterMap.set(0, 0);
        categoriesTaskCounterMap.set(1, 0);
        categoriesTaskCounterMap.set(2, 0);
        categoriesTaskCounterMap.set(3, 0);
        categoriesTaskCounterMap.set(4, 0);
        categoriesTaskCounterMap.set(5, 0);

        return categoriesTaskCounterMap;
    }

    private static async createErrorCategories(categoriesMap, categoriesTaskCounterMap) {
        let errorCategories = [];
        for(let indexForMaps = -1; indexForMaps < 6; indexForMaps ++) {
            let valueTempAllCategories = categoriesMap.get(indexForMaps);
            let valueTempAllTasksCategories = categoriesTaskCounterMap.get(indexForMaps);

            if(valueTempAllCategories < valueTempAllTasksCategories) {
                errorCategories.push(indexForMaps);
            }
        }

        return errorCategories;
    }
}