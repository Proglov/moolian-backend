import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";

const nameDoc = {
    description: 'Name of the subcategory, should be a non-empty string',
    type: String,
    example: 'name'
}

const categoryIdDoc = {
    description: 'the categoryId of the subcategory',
    type: String,
    example: '67cd7baedb92fc567e9df356'
}

export class CreateSubcategoryDto {
    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام زیر دسته بندی'))
    @IsNotEmpty(messages.notEmpty('نام زیر دسته بندی'))
    name: string;

    @ApiProperty(categoryIdDoc)
    @IsString(messages.isString('عکس زیر دسته بندی'))
    @IsNotEmpty(messages.notEmpty('عکس زیر دسته بندی'))
    categoryId: string;
}
