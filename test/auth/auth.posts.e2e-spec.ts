import { INestApplication } from '@nestjs/common';
import { DatabaseService } from 'test/helpers/Database.service';
import * as request from 'supertest';
import bootstrapTestApp from 'test/helpers/bootstrap.helper';
import { signupUser, missingEmail } from './auth.posts.e2e-spec.sample-data';

describe('[Auth] @Post (e2e)', () => {
    let app: INestApplication;
    let databaseService: DatabaseService;

    beforeAll(async () => {
        app = await bootstrapTestApp();
        databaseService = app.get(DatabaseService);
    });

    afterAll
        (async () => {
            try {
                await databaseService.dropDatabase();
            } catch (error) {
                console.error('Error during database cleanup:', error);
            } finally {
                await app.close();
            }
        });

    it('/signup - public', () => {
        console.log(signupUser);
        return request(app.getHttpServer())
            .post('/auth/user/sign-up')
            .send(signupUser)
            .expect(201)
            .then(res => {
                // This will only log on success, so let's add a catch below
                console.log('Response:', res.body);
            })
            .catch(err => {
                // This will log the error details (including validation errors)
                console.log('errrror:');
                if (err.response) {
                    console.error('Error Response:', err.response.body);
                }
                throw err; // rethrow to keep the test failing
            });
    });

    it('/signup - email is required', () => {
        return request(app.getHttpServer())
            .post('/auth/user/sign-up')
            .send(missingEmail)
            .expect(400)
    });
});
