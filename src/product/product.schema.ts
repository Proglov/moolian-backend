import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Category, Flavor, Gender, Season } from './enums/product.enums';
import { Note } from 'src/note/note.schema';
import { Brand } from 'src/brand/brand.schema';

export interface NoteWithCent {
    noteId: Types.ObjectId; // The ID of the note
    cent: number; // The cent from 1 to 100
}

@Schema({ versionKey: false })
export class Product extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    nameFA: string;

    @Prop({ type: String, required: true, unique: true })
    nameEN: string;

    @Prop({ type: Boolean, default: true })
    availability: boolean;

    @Prop({ type: SchemaTypes.ObjectId, ref: Brand.name, required: true })
    brandId: Types.ObjectId;

    @Prop({ type: String, required: true })
    desc: string;

    @Prop([{ type: String, required: true }])
    imageKeys: string[];

    // price of the 30ml in toman
    @Prop({ type: Number, required: true })
    price: number;

    @Prop({ type: String, required: true, enum: Gender })
    gender: string;

    @Prop([{ type: String, required: true, enum: Flavor }])
    flavor: string[];

    @Prop({ type: Number })
    year?: number;

    @Prop([{ type: String, enum: Season }])
    season?: string[];

    @Prop({ type: String })
    maker?: string;

    @Prop({ type: String })
    country?: string;

    @Prop({ type: String })
    Olfactory: string;

    @Prop({ type: String, enum: Category })
    category: string;

    @Prop({ type: [{ _id: false, noteId: { type: SchemaTypes.ObjectId, ref: Note.name }, cent: { type: Number, min: 1, max: 100 } }] })
    initialNoteObjects: NoteWithCent[];

    @Prop({ type: [{ _id: false, noteId: { type: SchemaTypes.ObjectId, ref: Note.name }, cent: { type: Number, min: 1, max: 100 } }] })
    midNoteObjects: NoteWithCent[];

    @Prop({ type: [{ _id: false, noteId: { type: SchemaTypes.ObjectId, ref: Note.name }, cent: { type: Number, min: 1, max: 100 } }] })
    baseNoteObjects: NoteWithCent[];

}


export const ProductSchema = SchemaFactory.createForClass(Product)