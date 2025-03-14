import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document, SchemaTypes, Types } from 'mongoose';
import { Flavor, Gender, Season } from './enums/product.enums';

@Schema({ versionKey: false })
export class Product extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    nameFA: string;

    @Prop({ type: String, required: true, unique: true })
    nameEN: string;

    @Prop({ type: Types.ObjectId, ref: 'Brand', required: true })
    brandId: mongoose.Schema.Types.ObjectId;

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

    @Prop([{ type: Types.ObjectId, ref: 'Note', required: true }])
    initialNoteIds: mongoose.Schema.Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'Note', required: true }])
    midNoteIds: mongoose.Schema.Types.ObjectId[];

    @Prop([{ type: Types.ObjectId, ref: 'Note', required: true }])
    baseNoteIds: mongoose.Schema.Types.ObjectId[];

}


export const ProductSchema = SchemaFactory.createForClass(Product)