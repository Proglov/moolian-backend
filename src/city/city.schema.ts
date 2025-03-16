import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, SchemaTypes, Types } from 'mongoose';
import { Province } from 'src/province/province.schema';

@Schema({ versionKey: false })
export class City extends Document {
    @Prop({ type: SchemaTypes.ObjectId, auto: true })
    _id: Types.ObjectId

    @Prop({ type: String, required: true, unique: true })
    name: string;

    @Prop({ type: SchemaTypes.ObjectId, ref: Province.name, required: true })
    provinceId: Types.ObjectId;
}


export const CitySchema = SchemaFactory.createForClass(City)