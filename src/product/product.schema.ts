import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Flavor, Gender, Season } from './enums/product.enums';
import { Note } from 'src/note/note.schema';
import { Brand } from 'src/brand/brand.schema';

@Schema({ versionKey: false })
export class Product extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    nameFA: string;

    @Prop({ type: String, required: true, unique: true })
    nameEN: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: Brand.name, required: true })
    brandId: Types.ObjectId;

    @Prop({ type: String, required: true })
    desc: string;

    @Prop([{ type: String, required: true }])
    imageKeys: string[];

    // price of the 30ml in toman
    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: String, required: true, enum: Gender })
    gender: string;

    @Prop([{ type: String, required: true, enum: Flavor }])
    flavor: string[];

    @Prop({ type: Number })
    year?: number;

    @Prop([{ type: String, enum: Season }])
    season?: string[];

    @Prop({ type: String })
    maker?: string;

    @Prop({ type: String })
    country?: string;

    // weight of the 30ml in gr
    @Prop({ type: Number })
    weight?: number;

    @Prop({ type: [SchemaTypes.ObjectId], ref: Note.name })
    initialNoteIds: Types.ObjectId[];

    @Prop({ type: [SchemaTypes.ObjectId], ref: Note.name })
    midNoteIds: Types.ObjectId[];

    @Prop({ type: [SchemaTypes.ObjectId], ref: Note.name })
    baseNoteIds: Types.ObjectId[];

}


export const ProductSchema = SchemaFactory.createForClass(Product)