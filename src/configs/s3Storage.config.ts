import { registerAs } from "@nestjs/config"

export default registerAs('s3Storage', () => ({
    endpoint: process.env.LIARA_ENDPOINT,
    bucketName: process.env.LIARA_BUCKET_NAME,
    access: process.env.LIARA_ACCESS_KEY,
    secret: process.env.LIARA_SECRET_KEY
}))