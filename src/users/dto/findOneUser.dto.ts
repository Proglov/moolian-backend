import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

const idDoc = {
    description: 'ID of the user, should be a non-empty ObjectId',
    type: String,
}


export class FindOneUserParamDto {
    @ApiProperty(idDoc)
    @IsString()
    @IsNotEmpty()
    id: string;
}