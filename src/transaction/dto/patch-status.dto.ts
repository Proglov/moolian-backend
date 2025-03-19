
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { NewStatusBySeller } from '../enums/transaction.enums';


const statusDoc = {
    enum: NewStatusBySeller,
    description: 'the new status of the transaction',
    type: String,
    example: "Sent"
}


export class PatchTransactionStatusBySellerDto {
    @ApiProperty(statusDoc)
    @IsString(messages.isString('وضعیت ارسال'))
    @IsNotEmpty(messages.notEmpty('وضعیت ارسال'))
    @IsEnum(NewStatusBySeller, { message: messages.isEnum('وضعیت ارسال', NewStatusBySeller).message })
    status: string;
}