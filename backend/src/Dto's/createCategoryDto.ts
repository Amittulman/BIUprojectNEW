import {IsNotEmpty, IsNumber, IsString} from 'class-validator';

export class CreateCategoryDto {
    @IsNumber()
    @IsNotEmpty()
    user_id: number;
    @IsNumber()
    @IsNotEmpty()
    category_id: number;
    @IsNotEmpty()
    @IsString()
    category_name: string;
    @IsNotEmpty()
    @IsString()
    color: string;
}
