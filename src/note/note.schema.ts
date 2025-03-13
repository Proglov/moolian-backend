import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class Note extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: String, required: true })
    imageKey: string;

}


export const NoteSchema = SchemaFactory.createForClass(Note)