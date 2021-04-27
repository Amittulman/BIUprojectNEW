import {IsNotEmpty, IsNumber} from 'class-validator';

export class CreateScheduledTaskDto {
    @IsNumber()
    task_id: number;
    @IsNumber()
    @IsNotEmpty()
    user_id: number;
    @IsNumber()
    @IsNotEmpty()
    slot_id: number;

}