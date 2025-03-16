import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Product } from 'src/product/product.schema';
import { User } from 'src/users/user.schema';

@Schema({ versionKey: false })
export class Comment extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId;

    @Prop({ type: String, required: true })
    body: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: User.name, required: true })
    userId: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: Product.name, required: true })
    productId: Types.ObjectId;

    @Prop({ type: SchemaTypes.ObjectId, ref: Comment.name, default: null })
    parentCommentId: Types.ObjectId;

    @Prop({ type: [SchemaTypes.ObjectId], ref: User.name })
    disLikeIds: Types.ObjectId[];

    @Prop({ type: [SchemaTypes.ObjectId], ref: User.name })
    likeIds: Types.ObjectId[];

    @Prop({ type: Boolean, default: false })
    validated: boolean;
}


export const CommentSchema = SchemaFactory.createForClass(Comment)