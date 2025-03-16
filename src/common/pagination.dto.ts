import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsPositive } from "class-validator";
import messages from "./dto.messages";


const limitDoc = {
    title: 'limit',
    description: 'items per page',
    default: 10,
    type: Number
}

const pageDoc = {
    title: 'page',
    description: 'page number',
    default: 1,
    type: Number
}

export class PaginationDto {
    @ApiPropertyOptional(limitDoc)
    @IsPositive(messages.isPositive('لیمیت'))
    @Type(() => Number)
    limit: number = 10;

    @ApiPropertyOptional(pageDoc)
    @IsPositive(messages.isPositive('صفحه'))
    @Type(() => Number)
    page: number = 1;

}