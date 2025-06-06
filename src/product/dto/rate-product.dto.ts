import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, Max, Min } from 'class-validator';
import messages from 'src/common/dto.messages';


const countDoc = {
    description: 'the count of the rate, should be a number between 1 and 5',
    type: Number,
    example: 3
}

export class RateProductDto {
    @ApiProperty(countDoc)
    @IsPositive(messages.isPositive('امتیاز به محصول'))
    @Min(...messages.min('امتیاز به محصول', 1))
    @Max(...messages.max('امتیاز به محصول', 5))
    count: number;
}
