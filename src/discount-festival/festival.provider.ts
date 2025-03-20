import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Festival } from './festival.schema';
import { Model } from 'mongoose';
import { requestTimeoutException } from 'src/common/errors';

@Injectable()
export class FestivalProvider {

    /** Inject the dependencies */
    constructor(
        /**  Inject the Festival Model */
        @InjectModel(Festival.name)
        private readonly festivalModel: Model<Festival>
    ) { }

    async removeExpiredFestivals() {
        try {
            await this.festivalModel.deleteMany({ until: { $lte: Date.now() } })
            return 200
        } catch (error) {
            throw requestTimeoutException('مشکلی در پاک کردن جشنواره ها رخ داده است')
        }
    }

}
