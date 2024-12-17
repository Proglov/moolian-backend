import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { Document } from 'mongoose';
import { User } from 'src/users/user.schema';

@Schema({ versionKey: false })
export class Admin extends Document {
    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: User.name,
        required: true,
        unique: true
    })
    userId: string;
}


export const AdminSchema = SchemaFactory.createForClass(Admin)