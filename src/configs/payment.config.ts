import { registerAs } from "@nestjs/config"

export default registerAs('bitpay', () => ({
    zibalToken: process.env.ZIBAL_TOKEN,
    merchantKey: process.env.ZIBAL_MERCHANT_KEY
}))