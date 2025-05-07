import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';
import { IsBoolean, IsOptional } from 'class-validator';
import messages from 'src/common/dto.messages';



const nameFADoc = {
    description: 'availability of the product, must be a boolean',
    type: Boolean,
    example: 'true'
}

export class UpdateProductDto extends PartialType(CreateProductDto) {
    @ApiProperty(nameFADoc)
    @IsBoolean(messages.isBoolean('نام فارسی محصول'))
    @IsOptional()
    availability: boolean;
}
