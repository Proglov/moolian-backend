import { Brand } from 'src/brand/brand.schema';
import { Product } from '../product.schema';
import { Note } from 'src/note/note.schema';
import { OmitType } from '@nestjs/swagger';
import { Festival } from 'src/discount-festival/festival.schema';

export class PopulatedNoteWithCent {
    noteId: Note;
    cent: number;
}
export class PopulatedProduct extends OmitType(Product, ['brandId', 'initialNoteObjects', 'midNoteObjects', 'baseNoteObjects'] as const) {
    brandId: Brand; // Populate Brand
    initialNoteObjects: PopulatedNoteWithCent[]; // Populate initial notes
    midNoteObjects: PopulatedNoteWithCent[]; // Populate mid notes
    baseNoteObjects: PopulatedNoteWithCent[]; // Populate base notes
    festival: Festival | null;
}