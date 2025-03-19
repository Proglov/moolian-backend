import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsObject, IsOptional, IsPositive, IsString, Max, Min, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import messages from 'src/common/dto.messages';
import { Category, Flavor, Gender, Season } from '../enums/product.enums';
import { NoteWithCent } from '../product.schema';
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { idDocGenerator } from 'src/common/findOne.dto';


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
    example: '67d29812d6718cfeef764364'
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
    description: 'the price of the 30ml in toman',
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

const olfactoryDoc = {
    description: 'the olfactory of the product',
    type: String,
    example: 'چوبی معطر'
}

const genderDoc = {
    enum: Gender,
    description: 'the gender of the product buyer',
    type: Number,
    example: Gender.unisex
}

const categoryDoc = {
    enum: Category,
    description: 'the category of the product buyer',
    type: Number,
    example: Category.gift
}

const flavorDoc = {
    enum: Flavor,
    description: 'the flavor of the product',
    type: Number,
    example: [Flavor.warm, Flavor.bitter]
}

const seasonDoc = {
    enum: Season,
    description: 'array of the season of the product',
    type: Number,
    example: [Season.spring, Season.autumn]
}

const centDoc = {
    description: 'the percentage of the note, should be a number between 1 and 100',
    type: Number,
    example: 50
}

class NoteWithCentDto implements NoteWithCent {
    @ApiProperty(centDoc)
    @IsPositive(messages.isPositive('درصد نوت محصول'))
    @Min(...messages.min('درصد نوت محصول', 1))
    @Max(...messages.max('درصد نوت محصول', 100))
    cent: number;

    @ApiProperty(idDocGenerator('noteId', 'product'))
    @IsString(messages.isString('آیدی نوت محصول'))
    @IsNotEmpty(messages.notEmpty('آیدی نوت محصول'))
    noteId: Types.ObjectId;
}

const initialNoteIdsDoc = {
    description: 'Array of initialNote objects with their percentages.',
    type: NoteWithCentDto,
    example: [
        { cent: 40, noteId: '67d2871d0aec874138e2351a' },
        { cent: 60, noteId: '67d2c48eb8c3f68e739fa0c8' }
    ]
}

const midNoteIdsDoc = {
    description: 'Array of midNote objects with their percentages.',
    type: NoteWithCentDto,
    example: [
        { cent: 40, noteId: '67d2871d0aec874138e2351a' },
        { cent: 60, noteId: '67d2c48eb8c3f68e739fa0c8' }
    ]
}

const baseNoteIdsDoc = {
    description: 'Array of baseNote objects with their percentages.',
    type: NoteWithCentDto,
    example: [
        { cent: 40, noteId: '67d2871d0aec874138e2351a' },
        { cent: 60, noteId: '67d2c48eb8c3f68e739fa0c8' }
    ]
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
    brandId: Types.ObjectId;

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

    @ApiProperty(olfactoryDoc)
    @IsString(messages.isString('گروه بویایی محصول'))
    olfactory: string;

    @ApiProperty(genderDoc)
    @IsEnum(Gender, { message: messages.isEnum('جنسیت خریدار محصول', Gender).message })
    gender: Gender;

    @ApiProperty(categoryDoc)
    @IsEnum(Category, { message: messages.isEnum('دسته بندی محصول', Category).message })
    category: Category;

    @ApiProperty(flavorDoc)
    @IsArray(messages.isArray('طبع محصول'))
    @IsEnum(Flavor, { each: true, message: messages.isEnum('طبع محصول', Flavor).message })
    @ArrayNotEmpty(messages.notEmpty('طبع محصول'))
    flavor: Flavor[];

    @ApiProperty(seasonDoc)
    @IsArray(messages.isArray('فصل محصول'))
    @IsEnum(Season, { each: true, message: messages.isEnum('فصل محصول', Season).message })
    @ArrayNotEmpty(messages.notEmpty('فصل محصول'))
    season: Season[];

    @ApiProperty(initialNoteIdsDoc)
    @ValidateNested({ each: true })
    @Type(() => NoteWithCentDto)
    @IsObject({ each: true })
    @IsArray(messages.isArray('آیدی های نوت های اولیه محصول به همراه درصد'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های نوت های اولیه محصول به همراه درصد'))
    initialNoteObjects: NoteWithCentDto[];

    @ApiProperty(midNoteIdsDoc)
    @ValidateNested({ each: true })
    @Type(() => NoteWithCentDto)
    @IsObject({ each: true })
    @IsArray(messages.isArray('آیدی های نوت های میانی محصول به همراه درصد'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های نوت های میانی محصول به همراه درصد'))
    midNoteObjects: NoteWithCentDto[];

    @ApiProperty(baseNoteIdsDoc)
    @ValidateNested({ each: true })
    @Type(() => NoteWithCentDto)
    @IsObject({ each: true })
    @IsArray(messages.isArray('آیدی های نوت های پابه محصول به به همراه درصد'))
    @ArrayNotEmpty(messages.notEmpty('آیدی های نوت های پابه محصول به به همراه درصد'))
    baseNoteObjects: NoteWithCentDto[];
}