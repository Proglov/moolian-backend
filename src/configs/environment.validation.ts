import * as Joi from "joi"

export default Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('production'),
    PORT: Joi.number().port().default(4500),
    MONGO_URI: Joi.string().required(),
    JWT_ACCESS_SIGNATURE: Joi.string().required(),
    JWT_ACCESS_TOKEN_TTL: Joi.number().default(3600),
    JWT_REFRESH_SIGNATURE: Joi.string().required(),
    JWT_REFRESH_TOKEN_TTL: Joi.number().default(86400),
    EMAIL_USERNAME: Joi.string().required(),
    EMAIL_PASSWORD: Joi.string().required(),
    EMAIL_HOST: Joi.string().required(),
    EMAIL_PORT: Joi.number().required(),
    EMAIL_FROM: Joi.string().required(),
    LIARA_ENDPOINT: Joi.string().uri().required(),
    LIARA_BUCKET_NAME: Joi.string().required(),
    LIARA_ACCESS_KEY: Joi.string().required(),
    LIARA_SECRET_KEY: Joi.string().required(),
    ALLOWED_ORIGINS: Joi.string().required()
})