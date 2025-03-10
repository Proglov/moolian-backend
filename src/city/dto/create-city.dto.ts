import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";

const nameDoc = {
    description: 'Name of the city, should be a non-empty string',
    type: String,
    example: 'name'
}

const provinceIdDoc = {
    description: 'the provinceId of the city',
    type: String,
    example: '67cd7baedb92fc567e9df356'
}

export class CreateCityDto {
    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام شهر'))
    @IsNotEmpty(messages.notEmpty('نام شهر'))
    name: string;

    @ApiProperty(provinceIdDoc)
    @IsString(messages.isString('عکس شهر'))
    @IsNotEmpty(messages.notEmpty('عکس شهر'))
    provinceId: string;
}
