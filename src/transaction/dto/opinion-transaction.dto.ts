
import { IsPositive, IsString, Max, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { IOpinion } from '../transaction.schema';


const commentDoc = {
    description: 'the comment of the opinion',
    type: String,
    example: "i liked that!"
}

const rateDoc = {
    description: 'the score of the transaction, should be a number between 1 and 5',
    type: Number,
    example: 4
}

export class OpinionTransActionDto implements IOpinion {
    @ApiProperty(rateDoc)
    @IsPositive(messages.isPositive('امتیاز به سفارش'))
    @Min(...messages.min('امتیاز به سفارش', 1))
    @Max(...messages.max('امتیاز به سفارش', 5))
    rate: number;

    @ApiPropertyOptional(commentDoc)
    @IsString(messages.isString('توضیحات نظر'))
    comment?: string;
}