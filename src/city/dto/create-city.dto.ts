import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import { Types } from "mongoose";
import messages from "src/common/dto.messages";
import { idDocGenerator } from "src/common/findOne.dto";

const nameDoc = {
    description: 'Name of the city, should be a non-empty string',
    type: String,
    example: 'name'
}

export class CreateCityDto {
    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام شهر'))
    @IsNotEmpty(messages.notEmpty('نام شهر'))
    name: string;

    @ApiProperty(idDocGenerator('provinceId', 'city'))
    @IsString(messages.isString('عکس شهر'))
    @IsNotEmpty(messages.notEmpty('عکس شهر'))
    provinceId: Types.ObjectId;
}
