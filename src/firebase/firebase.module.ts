import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';
import { FirebaseService } from './firebase.service';
import { AdminModule } from 'src/admin/admin.module';
import firebaseConfig from 'src/configs/firebase.config';

const firebaseProvider = {
    provide: 'FIREBASE_APP',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const firebaseConfig = {
            type: configService.get<string>('firebase.type'),
            project_id: configService.get<string>('firebase.projectId'),
            private_key_id: configService.get<string>('firebase.privateKeyId'),
            private_key: configService.get<string>('firebase.privateKey'),
            client_email: configService.get<string>('firebase.clientEmail'),
            client_id: configService.get<string>('firebase.clientId'),
            auth_uri: configService.get<string>('firebase.authURI'),
            token_uri: configService.get<string>('firebase.tokenURI'),
            auth_provider_x509_cert_url: configService.get<string>('firebase.authCertURI'),
            client_x509_cert_url: configService.get<string>('firebase.clientCertURI'),
            universe_domain: configService.get<string>('firebase.universalDomain'),
        } as admin.ServiceAccount;

        return admin.initializeApp({
            credential: admin.credential.cert(firebaseConfig),
            databaseURL: `https://${firebaseConfig.projectId}.firebaseio.com`,
            storageBucket: `${firebaseConfig.projectId}.appspot.com`,
        });
    },
};

@Module({
    imports: [
        ConfigModule.forFeature(firebaseConfig),
        AdminModule
    ],
    providers: [firebaseProvider, FirebaseService],
    exports: [FirebaseService],
})
export class FirebaseModule { }