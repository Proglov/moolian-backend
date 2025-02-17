import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const idDoc = {
    description: 'ID of the user, should be a non-empty ObjectId',
    type: String,
    example: '676293d54f5c4704c82c0733'
}


export class FindOneUserParamDto {
    @ApiProperty(idDoc)
    @IsString()
    @IsNotEmpty()
    id: string;
}