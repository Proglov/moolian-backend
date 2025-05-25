import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Admin } from './admin.schema';
import { InjectModel } from '@nestjs/mongoose';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { unauthorizedException } from 'src/common/errors';
import { SetAdminTokenDto } from './dto/admin-setToken.dto';


/** Class to preform operations related to JWT */
@Injectable()
export class AdminService {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Admin Model */
    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,
  ) { }

  /**
   * set the notification token
   */
  async setToken({ userId }: CurrentUserData, { token }: SetAdminTokenDto) {
    try {
      await this.adminModel.findOneAndUpdate({ userId }, { notificationToken: token });
    } catch (error) {
      throw unauthorizedException('wtf?')
    }
  }
}
