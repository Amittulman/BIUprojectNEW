import { Task } from "../interfaces/task.interface";
import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class CreateTaskDto {
    @IsNumber()
    @IsNotEmpty()
    taskID: number;
    @IsNumber()
    @IsNotEmpty()
    userId: number;
    @IsString()
    @IsNotEmpty()
    title: string;
    @IsNumber()
    @IsNotEmpty()
    duration: number;
    @IsNumber()
    @IsNotEmpty()
    priority: number;
    @IsNumber()
    @IsNotEmpty()
    categoryID: number;
    @IsString()
    @IsNotEmpty()
    constraints: string;
}