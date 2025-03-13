import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class Brand extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    nameFA: string;

    @Prop({ type: String, required: true, unique: true })
    nameEN: string;

    @Prop({ type: String, required: true })
    imageKey: string;

}


export const BrandSchema = SchemaFactory.createForClass(Brand)