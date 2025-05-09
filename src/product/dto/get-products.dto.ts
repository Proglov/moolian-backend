import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsBoolean, IsEnum, IsString } from "class-validator";
import messages from "src/common/dto.messages";
import { PaginationDto } from "src/common/pagination.dto";
import { Category, Flavor, Gender, Season } from "../enums/product.enums";
import { Transform } from "class-transformer";


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

const onlyAvailableDoc = {
    title: 'onlyAvailable',
    example: false,
    description: 'availability of the products',
    type: Boolean
}


export class GetProductsDto extends PaginationDto {
    @ApiPropertyOptional(onlyAvailableDoc)
    @IsBoolean()
    @Transform(({ value }) => value === 'true')
    onlyAvailable?: boolean = false;

    @ApiPropertyOptional(categoryDoc)
    @IsString(messages.isString('دسته بندی'))
    @IsEnum(Category, { message: messages.isEnum('دسته بندی', Category).message })
    category?: string = '';

    @ApiPropertyOptional(flavorDoc)
    @IsString(messages.isString('طعم'))
    @IsEnum(Flavor, { message: messages.isEnum('طعم', Flavor).message })
    flavor?: string = '';

    @ApiPropertyOptional(genderDoc)
    @IsString(messages.isString('جنسیت'))
    @IsEnum(Gender, { message: messages.isEnum('جنسیت', Gender).message })
    gender?: string = '';

    @ApiPropertyOptional(seasonDoc)
    @IsString(messages.isString('فصل'))
    @IsEnum(Season, { message: messages.isEnum('فصل', Season).message })
    season?: string = '';
}