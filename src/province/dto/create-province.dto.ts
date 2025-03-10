import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";

const nameDoc = {
    description: 'Name of the province, should be a non-empty string',
    type: String,
    example: 'آذربایجان شرقی'
}

export class CreateProvinceDto {
    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام استان'))
    @IsNotEmpty(messages.notEmpty('نام استان'))
    name: string;
}
