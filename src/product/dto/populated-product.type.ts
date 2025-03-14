import { Brand } from 'src/brand/brand.schema';
import { Product } from '../product.schema';
import { Note } from 'src/note/note.schema';

// Define the populated Product type
export type PopulatedProduct = Omit<Product, 'brandId' | 'initialNoteIds' | 'midNoteIds' | 'baseNoteIds'> & {
    brandId: Brand; // Populate Brand
    initialNoteIds: Note[]; // Populate initial notes
    midNoteIds: Note[]; // Populate mid notes
    baseNoteIds: Note[]; // Populate base notes
};
