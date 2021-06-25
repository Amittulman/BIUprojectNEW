import {IsNotEmpty, IsNumber} from 'class-validator';

export class CreateCategorySlotDto {
    @IsNumber()
    @IsNotEmpty()
    slot_id: number;
    @IsNumber()
    @IsNotEmpty()
    user_id: number;
    @IsNumber()
    @IsNotEmpty()
    category_id: number;

}