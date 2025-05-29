import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsEnum, IsOptional, IsString } from "class-validator";
import messages from "src/common/dto.messages";
import { PaginationDto } from "src/common/pagination.dto";
import { Category, Flavor, Gender, OrderBy, Season } from "../enums/product.enums";
import { Transform } from "class-transformer";
import { Types } from "mongoose";
import { idDocGenerator } from "src/common/findOne.dto";


const categoryDoc = {
    title: 'category',
    enum: Category,
    example: Category.party,
    description: 'category of the product',
    type: String
}

const flavorDoc = {
    title: 'flavor',
    enum: Flavor,
    example: Flavor.bitter,
    description: 'flavor of the product',
    type: String
}

const genderDoc = {
    title: 'gender',
    enum: Gender,
    example: Gender.unisex,
    description: 'gender of the product',
    type: String
}

const seasonDoc = {
    title: 'season',
    enum: Season,
    example: Season.autumn,
    description: 'season of the product',
    type: String
}

const orderByDoc = {
    title: 'orderBy',
    enum: OrderBy,
    example: OrderBy.expensive,
    description: 'orderBy of the product',
    type: String
}

const onlyAvailableDoc = {
    title: 'onlyAvailable',
    example: false,
    description: 'availability of the products',
    type: Boolean
}

const searchDoc = {
    description: 'the search string of the product',
    type: String,
    example: 'کرید اونتوس'
}

export class GetProductsDto extends PaginationDto {
    @ApiPropertyOptional(onlyAvailableDoc)
    @IsOptional()
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    onlyAvailable?: boolean = false;

    @ApiPropertyOptional(idDocGenerator('brandId', 'product'))
    @IsOptional()
    @IsString(messages.isString('آیدی برندها'))
    brandId?: string;

    @ApiPropertyOptional(categoryDoc)
    @IsOptional()
    @IsString(messages.isString('دسته بندی'))
    @IsEnum(Category, { message: messages.isEnum('دسته بندی', Category).message })
    category?: string;

    @ApiPropertyOptional(searchDoc)
    @IsOptional()
    @IsString(messages.isString('جست و جوی محصول'))
    search?: string;

    @ApiPropertyOptional(flavorDoc)
    @IsOptional()
    @IsString(messages.isString('طبع'))
    @IsEnum(Flavor, { message: messages.isEnum('طبع', Flavor).message })
    flavor?: string;

    @ApiPropertyOptional(genderDoc)
    @IsOptional()
    @IsString(messages.isString('جنسیت'))
    @IsEnum(Gender, { message: messages.isEnum('جنسیت', Gender).message })
    gender?: string;

    @ApiPropertyOptional(seasonDoc)
    @IsOptional()
    @IsString(messages.isString('فصل'))
    @IsEnum(Season, { message: messages.isEnum('فصل', Season).message })
    season?: string;

    @ApiPropertyOptional(orderByDoc)
    @IsOptional()
    @IsString(messages.isString('مرتب سازی'))
    @IsEnum(OrderBy, { message: messages.isEnum('مرتب سازی', OrderBy).message })
    orderBy?: string;
}