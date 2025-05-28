import { registerAs } from "@nestjs/config"

export default registerAs('api', () => ({
    url: process.env.API
}))