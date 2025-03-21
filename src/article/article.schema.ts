import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, now, SchemaTypes, Types } from 'mongoose';
import { Product } from 'src/product/product.schema';

@Schema({ versionKey: false })
export class Article extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true })
    title: string;

    @Prop({ type: String, required: true })
    content: string;

    @Prop({ type: Number, default: 0 })
    views: number;

    @Prop([{ type: String, required: true }])
    tags?: string;

    @Prop({ type: String, required: true })
    imageKey: string;

    @Prop([{ type: SchemaTypes.ObjectId, ref: Product.name, required: true }])
    productIds?: Types.ObjectId[];

    @Prop({ default: now() })
    createdAt: Date;
}


export const ArticleSchema = SchemaFactory.createForClass(Article)
