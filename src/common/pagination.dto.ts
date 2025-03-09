import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsPositive } from "class-validator";


const limitDoc = {
    title: 'limit',
    description: 'items per page',
    default: 10,
    type: Number
}

const pageDoc = {
    title: 'page',
    description: 'take how many items',
    default: 1,
    type: Number
}

export class PaginationDto {
    @ApiPropertyOptional(limitDoc)
    @IsPositive()
    @Type(() => Number)
    limit: number = 10;

    @ApiPropertyOptional(pageDoc)
    @IsPositive()
    @Type(() => Number)
    page: number = 1;

}