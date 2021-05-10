import { Task } from "../interfaces/task.interface";
import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class CreateTaskDto {
    @IsNumber()
    task_id: number;
    @IsNumber()
    @IsNotEmpty()
    user_id: number;
    @IsString()
    @IsNotEmpty()
    task_title: string;
    @IsNumber()
    @IsNotEmpty()
    duration: number;
    @IsNumber()
    @IsNotEmpty()
    priority: number;
    @IsNumber()
    @IsNotEmpty()
    category_id: number;
    constraints: number[][];
}