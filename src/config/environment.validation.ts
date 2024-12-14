import * as Joi from "joi"

export default Joi.object({
    NODE_ENV: Joi.string().valid('development', 'test', 'production').default('production'),
    PORT: Joi.number().port().default(4500),
    MONGO_URI: Joi.string().required()
})