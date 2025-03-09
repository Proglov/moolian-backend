import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";

const nameDoc = {
    description: 'Name of the category, should be a non-empty string',
    type: String,
    example: 'name'
}

const imageKeyDoc = {
    description: 'the imageKey of the category',
    type: String,
    example: '1741259929433_ghahve.jpg'
}

export class CreateCategoryDto {
    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام دسته بندی'))
    @IsNotEmpty(messages.notEmpty('نام دسته بندی'))
    name: string;

    @ApiProperty(imageKeyDoc)
    @IsString(messages.isString('عکس دسته بندی'))
    @IsNotEmpty(messages.notEmpty('عکس دسته بندی'))
    imageKey: string;
}
