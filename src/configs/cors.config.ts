import { registerAs } from "@nestjs/config"

export default registerAs('allowedOrigins', () => ({
    allowedOrigins: process.env?.ALLOWED_ORIGINS.split(',')
}))

export const corsOptions = (allowedOrigins: string[]) => ({
    origin: allowedOrigins,
    credentials: true
})