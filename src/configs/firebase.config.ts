import { registerAs } from "@nestjs/config";


export default registerAs('firebase', () => ({
    type: process.env.FIREBASE_TYPE,
    projectId: process.env.FIREBASE_PROJECT_ID,
    privateKeyId: process.env.FIREBASE_PRIVATE_KEY_ID,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    clientId: process.env.FIREBASE_CLIENT_ID,
    authURI: process.env.FIREBASE_AUTH_URI,
    tokenURI: process.env.FIREBASE_TOKEN_URI,
    authCertURI: process.env.FIREBASE_AUTH_CERT_URL,
    clientCertURI: process.env.FIREBASE_CLIENT_CERT_URL,
    universalDomain: process.env.FIREBASE_UNIVERSAL_DOMAIN,
}))