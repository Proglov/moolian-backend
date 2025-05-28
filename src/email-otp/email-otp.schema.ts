import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { User } from 'src/users/user.schema';

@Schema({ versionKey: false })
export class EmailOTP extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({
        type: SchemaTypes.ObjectId,
        ref: User.name,
        required: true,
        unique: true
    })
    userId: Types.ObjectId;

    @Prop({ type: String, required: true, })
    token: string;

    @Prop({ default: () => new Date() })
    createdAt: Date;
}


export const EmailOTPSchema = SchemaFactory.createForClass(EmailOTP)