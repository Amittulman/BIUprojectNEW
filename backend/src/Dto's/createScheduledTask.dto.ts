import {IsNotEmpty, IsNumber} from 'class-validator';

export class CreateScheduledTaskDto {
    @IsNumber()
    taskID: number;
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    @IsNumber()
    @IsNotEmpty()
    slotID: number;

}