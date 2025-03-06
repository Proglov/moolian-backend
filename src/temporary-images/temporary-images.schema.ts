import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now, SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false, timestamps: true })
export class TemporaryImage extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true })
    name: string;

    @Prop({ default: now() })
    createdAt: Date;
}


export const TemporaryImageSchema = SchemaFactory.createForClass(TemporaryImage)