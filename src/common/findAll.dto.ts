import { ApiProperty } from "@nestjs/swagger";
import { IsPositive } from "class-validator";
import messages from "./dto.messages";


const itemsDoc = {
    title: 'items',
    description: 'items',
    example: {
        _id: '676293d54f5c4704c82c0733'
    }
}

const countDoc = {
    title: 'count',
    description: 'count of items',
    type: Number
}

export class FindAllDto<T> {
    @ApiProperty(itemsDoc)
    items: T[];

    @ApiProperty(countDoc)
    @IsPositive(messages.isPositive('تعداد'))
    count: number;

}