import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Category, Flavor, Gender, Season } from './enums/product.enums';
import { Note } from 'src/note/note.schema';
import { Brand } from 'src/brand/brand.schema';
import { User } from 'src/users/user.schema';

export interface NoteWithCent {
    noteId: Types.ObjectId; // The ID of the note
    cent: number; // The cent from 1 to 100
}

export interface IProductRate {
    userId: Types.ObjectId;
    count: number;
}

@Schema({ versionKey: false })
export class Product extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true, index: true })
    nameFA: string;

    @Prop({ type: String, required: true, unique: true, index: true })
    nameEN: string;

    @Prop({ type: Boolean, default: true, index: true })
    availability: boolean;

    @Prop({ type: [{ _id: false, userId: { type: SchemaTypes.ObjectId, ref: User.name }, count: { type: Number, min: 1, max: 5 } }] })
    rates: IProductRate[];

    @Prop({ type: SchemaTypes.ObjectId, ref: Brand.name, required: true, index: true })
    brandId: Types.ObjectId;

    @Prop({ type: String, required: true })
    desc: string;

    @Prop([{ type: String, required: true }])
    imageKeys: string[];

    @Prop({ type: Number, required: true, index: true })
    price: number;

    @Prop({ type: String, required: true, enum: Gender, index: true })
    gender: string;

    @Prop([{ type: String, required: true, enum: Flavor, index: true }])
    flavor: string[];

    @Prop({ type: Number, index: true })
    year?: number;

    @Prop([{ type: String, enum: Season, index: true }])
    season?: string[];

    @Prop({ type: String, index: true })
    maker?: string;

    @Prop({ type: String, index: true })
    country?: string;

    @Prop({ type: String, index: true })
    olfactory: string;

    @Prop({ type: String, enum: Category, index: true })
    category: string;

    @Prop({ type: [{ _id: false, noteId: { type: SchemaTypes.ObjectId, ref: Note.name }, cent: { type: Number, min: 1, max: 100 } }] })
    initialNoteObjects: NoteWithCent[];

    @Prop({ type: [{ _id: false, noteId: { type: SchemaTypes.ObjectId, ref: Note.name }, cent: { type: Number, min: 1, max: 100 } }] })
    midNoteObjects: NoteWithCent[];

    @Prop({ type: [{ _id: false, noteId: { type: SchemaTypes.ObjectId, ref: Note.name }, cent: { type: Number, min: 1, max: 100 } }] })
    baseNoteObjects: NoteWithCent[];
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Add compound indexes for common query patterns
ProductSchema.index({ brandId: 1, category: 1 });
ProductSchema.index({ gender: 1, category: 1 });
ProductSchema.index({ price: 1, availability: 1 });
ProductSchema.index({ flavor: 1, season: 1 });
ProductSchema.index({ maker: 1, country: 1 });