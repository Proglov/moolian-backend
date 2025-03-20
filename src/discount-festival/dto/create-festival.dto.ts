import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsPositive, IsString, Max, Min } from "class-validator";
import { Types } from "mongoose";
import messages from "src/common/dto.messages";
import { idDocGenerator } from "src/common/findOne.dto";

const untilDoc = {
    description: 'when does the festival lasts, should be a non-empty string',
    type: String,
    example: '1752483679676'
}

const offPercentageDoc = {
    description: 'the offPercentage of the note, should be a number between 1 and 100',
    type: Number,
    example: 50
}

export class CreateFestivalDto {
    @ApiProperty(idDocGenerator('productId', 'festival'))
    @IsString(messages.isString('آیدی محصول'))
    @IsNotEmpty(messages.notEmpty('آیدی محصول'))
    productId: Types.ObjectId;

    @ApiProperty(untilDoc)
    @IsString(messages.isString('انقضا جشنواره'))
    @IsNotEmpty(messages.notEmpty('انقضا جشنواره'))
    until: string;

    @ApiProperty(offPercentageDoc)
    @IsPositive(messages.isPositive('درصد تخفیف'))
    @Min(...messages.min('درصد تخفیف', 1))
    @Max(...messages.max('درصد تخفیف', 99))
    offPercentage: number;
}
