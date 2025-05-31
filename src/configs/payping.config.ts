import { registerAs } from "@nestjs/config"

export default registerAs('bitpay', () => ({
    apiKey: process.env.PAYPING_API_KEY
}))