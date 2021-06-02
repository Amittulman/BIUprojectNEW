import {IsNotEmpty, IsNumber} from "class-validator";

export class CreateUserDto {
    @IsNotEmpty()
    user_name:string;
    @IsNotEmpty()
    user_pass:string;
}