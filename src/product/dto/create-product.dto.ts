import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { Flavor, Gender, Season } from '../enums/product.enums';


const nameFADoc = {
    description: 'Farsi Name of the product, must be a non-empty string',
    type: String,
    example: 'کرید اونتوس'
}

const nameENDoc = {
    description: 'English Name of the product, must be a non-empty string',
    type: String,
    example: 'Creed Aventus'
}

const brandIdDoc = {
    description: 'the brandId of the product',
    type: String,
    example: '67cd7baedb92fc567e9df356'
}

const descDoc = {
    description: 'the description of the product',
    type: String,
    example: 'عطر ادکلن مولکول 02 توسط اسنتریک مولکول عطری است کهربایی زنانه و مردانه . مولکول 02 در سال 2008 روانه بازار شد. سازنده این عطر Geza Schoen است'
}

const imageKeysDoc = {
    description: 'ImageKeys of the product, must be a non-empty array of strings',
    type: String,
    isArray: true,
    example: ['1741259929433_ghahve.jpg', '1741259929433_ghahve.jpg']
}

const priceDoc = {
    description: 'the price of the product in toman',
    type: Number,
    example: 2_000_000
}

const yearDoc = {
    description: 'the year of the made product',
    type: Number,
    example: 2025
}

const makerDoc = {
    description: 'the maker of the product',
    type: String,
    example: 'akbar'
}

const countryDoc = {
    description: 'the country of the product',
    type: String,
    example: 'فرانسه'
}

const weightDoc = {
    description: 'the weight of the made product',
    type: Number,
    example: 25
}

const genderDoc = {
    description: 'the gender of the product buyer',
    type: Number,
    example: Gender.unisex
}

const flavorDoc = {
    description: 'the flavor of the product',
    type: Number,
    example: [Flavor.warm]
}

const seasonDoc = {
    description: 'the season of the product',
    type: Number,
    example: [Season.warm]
}

const initialNoteIdsDoc = {
    description: 'InitialNoteIds of the product, must be a non-empty array of ids',
    type: String,
    isArray: true,
    example: ['67cd7baedb92fc567e9df356', '67cd7baedb92fc567e9df356']
}

const midNoteIdsDoc = {
    description: 'MidNoteIds of the product, must be a non-empty array of ids',
    type: String,
    isArray: true,
    example: ['67cd7baedb92fc567e9df356', '67cd7baedb92fc567e9df356']
}

const baseNoteIdsDoc = {
    description: 'BaseNoteIds of the product, must be a non-empty array of ids',
    type: String,
    isArray: true,
    example: ['67cd7baedb92fc567e9df356', '67cd7baedb92fc567e9df356']
}

export class CreateProductDto {

    @ApiProperty(nameFADoc)
    @IsString(messages.isString('نام فارسی محصول'))
    nameFA: string;

    @ApiProperty(nameENDoc)
    @IsString(messages.isString('نام انگلیسی محصول'))
    nameEN: string;

    @ApiProperty(brandIdDoc)
    @IsString(messages.isString('آیدی برند'))
    @IsNotEmpty(messages.notEmpty('آیدی برند'))
    brandId: string;

    @ApiProperty(descDoc)
    @IsString(messages.isString('توضیحات محصول'))
    desc: string;

    @ApiPropertyOptional(imageKeysDoc)
    @IsArray(messages.isString('عکس های محصول'))
    @ArrayNotEmpty(messages.notEmpty('عکس های محصول'))
    @IsString({ each: true, ...messages.isString('عکس های محصول') })
    @IsOptional()
    imageKeys: string[];

    @ApiProperty(priceDoc)
    @IsPositive(messages.isPositive('قیمت محصول'))
    price: number;

    @ApiPropertyOptional(yearDoc)
    @IsPositive(messages.isPositive('سال ساخت محصول'))
    year?: number;

    @ApiPropertyOptional(makerDoc)
    @IsString(messages.isString('عطار محصول'))
    maker?: string;

    @ApiPropertyOptional(countryDoc)
    @IsString(messages.isString('کشور سازنده محصول'))
    country?: string;

    @ApiPropertyOptional(weightDoc)
    @IsPositive(messages.isPositive('وزن سی میلیلیتر محصول به گرم'))
    weight?: number;

    @ApiProperty(genderDoc)
    @IsEnum(Gender, { message: messages.isEnum('جنسیت خریدار محصول', Gender).message })
    gender: Gender;

    @ApiProperty(flavorDoc)
    @IsArray(messages.isArray('طبع محصول'))
    @IsEnum(Flavor, { each: true, message: messages.isEnum('طبع محصول', Flavor).message })
    flavor: Flavor[];

    @ApiProperty(seasonDoc)
    @IsArray(messages.isArray('فصل محصول'))
    @IsEnum(Season, { each: true, message: messages.isEnum('فصل محصول', Season).message })
    season: Season[];

    @ApiProperty(initialNoteIdsDoc)
    @IsString({ each: true, ...messages.isString('آیدی های نوت های اولیه محصول') })
    @IsArray(messages.isArray('آیدی های نوت های اولیه محصول'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های نوت های اولیه محصول'))
    initialNoteIds: string[];

    @ApiProperty(midNoteIdsDoc)
    @IsString({ each: true, ...messages.isString('آیدی های نوت های میانی محصول') })
    @IsArray(messages.isArray('آیدی های نوت های میانی محصول'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های نوت های میانی محصول'))
    midNoteIds: string[];

    @ApiProperty(baseNoteIdsDoc)
    @IsString({ each: true, ...messages.isString('آیدی های نوت های پابه محصول') })
    @IsArray(messages.isArray('آیدی های نوت های پابه محصول'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های نوت های پابه محصول'))
    baseNoteIds: string[];
}