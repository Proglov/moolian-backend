import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class Subcategory extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
    categoryId: { type: Types.ObjectId; ref: 'Category' };

}


export const SubcategorySchema = SchemaFactory.createForClass(Subcategory)