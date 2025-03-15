import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from './dto.messages';


export const idDocGenerator = (name: string, item: string) => ({
    description: `${name} of the ${item}, should be a non-empty ObjectId`,
    type: String,
    example: '67cd7baedb92fc567e9df356'
})


export class FindOneDto {
    @ApiProperty(idDocGenerator('ID', 'item'))
    @IsString(messages.isString('آیدی'))
    @IsNotEmpty(messages.notEmpty('آیدی'))
    id: string;
}