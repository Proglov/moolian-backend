import { Injectable } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { Admin } from './admin.schema';
import { InjectModel } from '@nestjs/mongoose';


/** Class to preform operations related to JWT */
@Injectable()
export class AdminProvider {

  /** Inject the dependencies */
  constructor(
    /**  Inject the Admin Model */
    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,
  ) { }

  /**
   * Check if the User is Admin by its Id
   */
  async isAdmin(userId: Types.ObjectId): Promise<boolean> {
    try {
      const existingAdmin = await this.adminModel.findOne({ userId })
      if (!existingAdmin) throw new Error()
      return true
    } catch (error) {
      return false
    }
  }
}
