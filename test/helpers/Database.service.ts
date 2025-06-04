import { ConfigService } from '@nestjs/config';
import { Connection } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';

@Injectable()
export class DatabaseService {
    constructor(
        @InjectConnection() private readonly connection: Connection,
        private readonly configService: ConfigService,
    ) {
        const uri = this.configService.get<string>('database.URI')
        if (!uri.includes('localhost') || !uri.includes('test'))
            throw new Error('DB is not for testing')
    }

    async dropDatabase(): Promise<void> {
        const collections = Object.keys(this.connection.collections);

        for (const collectionName of collections) {
            const collection = this.connection.collections[collectionName];
            try {
                await collection.deleteMany({});
            } catch (error) {
                console.warn(`Failed to clear collection ${collectionName}:`, error);
            }
        }
    }
}
