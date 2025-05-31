import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";
import messages from "src/common/dto.messages";


const refIdDoc = {
    title: 'refId',
    description: 'refId of the payment, should be a non-empty string',
    type: String
}

const clientRefIdDoc = {
    title: 'clientRefId',
    description: 'id of the transaction, should be a non-empty string',
    type: String
}

const cardNumberDoc = {
    title: 'cardNumber',
    description: 'if of the transaction, should be a non-empty string',
    type: String
}

const cardHashPanDoc = {
    title: 'cardHashPan',
    description: 'if of the transaction, should be a non-empty string',
    type: String
}

export class GetRedirectDto {
    @ApiProperty(refIdDoc)
    @IsString(messages.isString('refId'))
    @IsNotEmpty(messages.notEmpty('refId'))
    refid: string;

    @ApiProperty(clientRefIdDoc)
    @IsString(messages.isString('clientRefId'))
    @IsNotEmpty(messages.notEmpty('clientRefId'))
    clientrefid: string;

    @ApiProperty(cardNumberDoc)
    @IsString(messages.isString('cardNumber'))
    @IsNotEmpty(messages.notEmpty('cardNumber'))
    cardnumber: string;

    @ApiProperty(cardHashPanDoc)
    @IsString(messages.isString('cardHashPan'))
    @IsNotEmpty(messages.notEmpty('cardHashPan'))
    cardhashpan: string;
}