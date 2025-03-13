import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";

const nameDoc = {
    description: 'Name of the note, should be a non-empty string',
    type: String,
    example: 'name'
}

const imageKeyDoc = {
    description: 'the imageKey of the note',
    type: String,
    example: '1741259929433_ghahve.jpg'
}

export class CreateNoteDto {
    @ApiProperty(nameDoc)
    @IsString(messages.isString('نام نوت'))
    @IsNotEmpty(messages.notEmpty('نام نوت'))
    name: string;

    @ApiProperty(imageKeyDoc)
    @IsString(messages.isString('عکس نوت'))
    @IsNotEmpty(messages.notEmpty('عکس نوت'))
    imageKey: string;
}
