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

  async isAdmin(userId: string): Promise<boolean> {
    try {
      const existingAdmin = await this.adminModel.findOne({ userId })
      if (!existingAdmin) throw new Error()
      return true
    } catch (error) {
      return false
    }
  }
}
