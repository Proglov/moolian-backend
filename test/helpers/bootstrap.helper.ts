import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AppModule } from 'src/app.module';
import { DatabaseService } from './Database.service';
import createApp from 'src/app.create';
import { getConnectionToken } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

export default async function bootstrapTestApp(): Promise<INestApplication> {
    try {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
            providers: [DatabaseService],
        }).compile();

        const app = moduleFixture.createNestApplication();
        createApp(app);

        // Wait for Mongoose connection to be ready
        const connection = moduleFixture.get<Connection>(getConnectionToken());
        await new Promise<void>((resolve, reject) => {
            connection.on('connected', () => {
                resolve();
            });
            connection.on('error', (err) => {
                console.error('MongoDB connection error:', err);
                reject(err);
            });
            // Handle case where connection is already open
            if (connection.readyState === 1) {
                resolve();
            }
        });

        await app.init();
        return app;
    } catch (error) {
        console.error('Error in bootstrapTestApp:', error);
        throw error;
    }
}