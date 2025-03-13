import { ArrayNotEmpty, IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';

const idsDoc = {
    description: 'IDs of the item, should be a non-empty ObjectId',
    isArray: true,
    type: String,
    example: [
        "67ced24769646a04530638b3",
        "67ced23d69646a04530638b0",
        "67ceb7aa7d31842c96694e58"
    ]
}


export class CitiesIdsDto {
    @ApiProperty(idsDoc)
    @ArrayNotEmpty(messages.notEmpty('آیدی شهرها'))
    @IsString({ message: messages.isString('آیدی شهرها').message, each: true })
    @IsArray(messages.isArray('آیدی شهرها'))
    ids: string[];
}