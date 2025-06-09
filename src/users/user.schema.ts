import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { ApiProperty } from '@nestjs/swagger';

/**
 * User schema representing a user in the system
 * @class User
 * @extends Document
 */
@Schema({ versionKey: false })
export class User extends Document {
    @ApiProperty({ description: 'Unique identifier for the user', type: String })
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @ApiProperty({ description: 'JWT refresh token for authentication', required: false })
    @Prop({ type: String })
    refreshToken?: string

    @ApiProperty({ description: 'Unique username for the user', required: true })
    @Prop({ type: String, required: true, unique: true })
    username: string;

    @ApiProperty({ description: 'User email address', required: false })
    @Prop({ type: String, unique: true })
    email: string;

    @ApiProperty({ description: 'Hashed password', required: true })
    @Prop({ type: String, required: true })
    password: string;

    @ApiProperty({ description: 'Full name of the user', required: false })
    @Prop({ type: String, default: "" })
    name?: string;

    @ApiProperty({ description: 'Array of user addresses', required: false, type: [String] })
    @Prop({ type: [String] })
    address?: string[];

    @ApiProperty({ description: 'User phone number', required: true })
    @Prop({ type: String, unique: true, required: true })
    phone: string;

    @ApiProperty({ description: 'Whether the email is verified', default: false })
    @Prop({ type: Boolean, default: false })
    isEmailVerified: boolean = false;

    @ApiProperty({ description: 'Whether the phone is verified', default: false })
    @Prop({ type: Boolean, default: false })
    isPhoneVerified: boolean = false;
}

export const UserSchema = SchemaFactory.createForClass(User)