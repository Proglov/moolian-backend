
import { ArrayNotEmpty, IsArray, IsNotEmpty, IsObject, IsPositive, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { idDocGenerator } from 'src/common/findOne.dto';
import { BoughtProducts } from '../transaction.schema';


const addressDoc = {
    description: 'the address of the location',
    type: String,
    example: 'تهران سوهانک'
}

const shouldBeSentAtDoc = {
    description: 'the shouldBeSentAt of the tx. it should be an epoch time',
    type: String,
    example: '1842237668599'
}

const quantityDoc = {
    description: 'the quantity of the tx, should be a number between 1 and 100',
    type: Number,
    example: 3
}

class BoughtProductsDto implements BoughtProducts {
    @ApiProperty(quantityDoc)
    @IsPositive(messages.isPositive('تعداد محصولات'))
    @Min(...messages.min('تعداد محصولات', 1))
    @Max(...messages.max('تعداد محصولات', 100))
    quantity: number;

    @ApiProperty(idDocGenerator('productId', 'product'))
    @IsString(messages.isString('آیدی محصول'))
    @IsNotEmpty(messages.notEmpty('آیدی محصول'))
    productId: Types.ObjectId;
}

const boughtProductsDoc = {
    description: 'Array of bought Products Id with their quantity.',
    type: BoughtProductsDto,
    example: [
        { quantity: 4, productId: '67d80a025776f2ae1628725a' },
        { quantity: 6, productId: '67d953efbc7a803b1b24c58c' }
    ]
}

export class CreateTransactionDto {
    @ApiProperty(addressDoc)
    @IsString(messages.isString('آدرس ارسال'))
    @IsNotEmpty(messages.notEmpty('آدرس ارسال'))
    address: string;

    @ApiProperty(shouldBeSentAtDoc)
    @IsString(messages.isString('زمان ارسال'))
    @IsNotEmpty(messages.notEmpty('زمان ارسال'))
    shouldBeSentAt: string;

    @ApiProperty(boughtProductsDoc)
    @ValidateNested({ each: true })
    @Type(() => BoughtProductsDto)
    @IsObject({ each: true })
    @IsArray(messages.isArray('آیدی محصولات خریداری شده به همراه تعداد'))
    @ArrayNotEmpty(messages.notEmpty('آیدی محصولات خریداری شده به همراه تعداد'))
    boughtProducts: BoughtProductsDto[];
}