import { registerAs } from "@nestjs/config";


export default registerAs('jwt', () => ({
    secret: process.env.JWT_SIGNATURE,
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL) || 3600,
    refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL) || 86400,
}))