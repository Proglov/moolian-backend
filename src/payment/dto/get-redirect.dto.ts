import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, IsNumberString } from "class-validator";
import messages from "src/common/dto.messages";

const trackIdDoc = {
    title: 'trackId',
    description: 'Zibal transaction tracking ID (number as string)',
    type: String
};

const successDoc = {
    title: 'success',
    description: 'Indicates if the payment was successful (1 or 0, as string)',
    type: String
};

const statusDoc = {
    title: 'status',
    description: 'Status code of the payment (number as string)',
    type: String
};

const orderIdDoc = {
    title: 'orderId',
    description: 'Your order ID associated with the payment (string)',
    type: String
};

export class GetRedirectDto {
    @ApiProperty(trackIdDoc)
    @IsNumberString({}, messages.isString('trackId'))
    @IsNotEmpty(messages.notEmpty('trackId'))
    trackId: string;

    @ApiProperty(successDoc)
    @IsNumberString({}, messages.isString('success'))
    @IsNotEmpty(messages.notEmpty('success'))
    success: string;

    @ApiProperty(statusDoc)
    @IsNumberString({}, messages.isString('status'))
    @IsNotEmpty(messages.notEmpty('status'))
    status: string;

    @ApiProperty(orderIdDoc)
    @IsString(messages.isString('orderId'))
    @IsNotEmpty(messages.notEmpty('orderId'))
    orderId: string;
}
