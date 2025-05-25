import { Inject, Injectable } from '@nestjs/common';
import { app } from 'firebase-admin';
import { AdminProvider } from 'src/admin/admin.provider';

@Injectable()
export class FirebaseService {
    constructor(
        @Inject('FIREBASE_APP') private firebaseApp: app.App,

        //  inject admin provider to get the tokens
        private readonly adminProvider: AdminProvider
    ) { }

    async sendNotificationToAdmins(
        title: string,
        body: string,
        icon?: string,
        data?: Record<string, string>,
    ): Promise<string[]> {
        const tokens = await this.adminProvider.getNotificationTokens();
        if (!tokens.length) return [];

        const message = {
            notification: { title, body, icon },
            data,
            tokens,
        };

        try {
            const response = await this.firebaseApp.messaging().sendEachForMulticast(message);

            // response.responses is an array of send results
            return response.responses
                .map((res, idx) => (res.success ? tokens[idx] : null))
                .filter(Boolean) as string[];
        } catch (error) {
            console.log(error.responses[0].error);
            throw new Error(`Failed to send notifications: ${error.message}`);
        }
    }
}