import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { User } from 'src/users/user.schema';

@Schema({ versionKey: false })
export class Admin extends Document {
    @Prop({
        type: SchemaTypes.ObjectId,
        ref: User.name,
        required: true,
        unique: true
    })
    userId: Types.ObjectId;
}


export const AdminSchema = SchemaFactory.createForClass(Admin)