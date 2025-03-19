
import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';


const reasonDoc = {
    description: 'the reason of the cancel',
    type: String,
    example: "we don't have this amount of this product!"
}


export class CancelTransActionDto {
    @ApiProperty(reasonDoc)
    @IsString(messages.isString('علت کنسلی'))
    @IsNotEmpty(messages.notEmpty('علت کنسلی'))
    reason: string;
}