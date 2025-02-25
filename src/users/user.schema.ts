import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';

@Schema({ versionKey: false })
export class User extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String })
    refreshToken?: string

    @Prop({ type: String, required: true, unique: true })
    username: string;

    @Prop({ type: String, unique: true })
    email: string;

    @Prop({ type: String, required: true })
    password: string;

    @Prop({ type: String, default: "" })
    name?: string;

    @Prop({ type: [String] })
    address?: string[];

    @Prop({ type: String, unique: true, required: true })
    phone: string;
}


export const UserSchema = SchemaFactory.createForClass(User)