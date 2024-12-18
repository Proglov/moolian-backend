import { Injectable } from '@nestjs/common';
import { Model } from 'mongoose';
import { Admin } from './admin.schema';
import { InjectModel } from '@nestjs/mongoose';

@Injectable()
export class AdminProvider {
  constructor(
    @InjectModel(Admin.name)
    private readonly adminModel: Model<Admin>,
  ) { }

  async isAdmin(id: string): Promise<boolean> {
    try {
      const allAdmins = await this.adminModel.find()
      let result = false
      for (const admin of allAdmins) {
        if (admin.userId == id) {
          result = true;
          break
        }
      }
      return result;
    } catch (error) {
      return false
    }
  }
}
