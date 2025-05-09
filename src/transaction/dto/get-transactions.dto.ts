import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsBoolean, IsOptional } from "class-validator";
import { PaginationDto } from "src/common/pagination.dto";


const onlyRequestedDoc = {
    title: 'onlyRequested',
    example: false,
    description: 'only recently requested transactions',
    type: Boolean
}


export class GetTransactionsDto extends PaginationDto {
    @ApiPropertyOptional(onlyRequestedDoc)
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    onlyRequested?: boolean = false;
}