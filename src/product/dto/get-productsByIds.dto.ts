import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";
import { Types } from "mongoose";

const idsDoc = {
    description: 'ids of the product, should be a non-empty array of ObjectIds',
    type: String,
    isArray: true,
    example: ['67cd7baedb92fc567e9df356']
}

export class GetProductsByIdsDto {
    @ApiProperty(idsDoc)
    @IsString({ ...messages.isString('آیدی'), each: true })
    @IsNotEmpty({ ...messages.notEmpty('آیدی'), each: true })
    @IsArray(messages.isArray('آیدی محصولات مجله'))
    ids: Types.ObjectId[];
}