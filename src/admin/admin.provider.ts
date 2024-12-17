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
      const existingAdmin = await this.adminModel.findById(id)
      return !!existingAdmin;
    } catch (error) {
      return false
    }
  }
}
