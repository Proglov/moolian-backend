import { Body, Controller, HttpCode, HttpStatus, Patch } from '@nestjs/common';
import { ApiTags, ApiResponse, ApiOperation } from '@nestjs/swagger';
import { Auth } from 'src/auth/decorators/auth.decorator';
import { AuthType } from 'src/auth/enums/auth-types';
import { CurrentUserData } from 'src/auth/interfacesAndType/current-user-data.interface';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { AdminService } from './admin.service';
import { SetAdminTokenDto } from './dto/admin-setToken.dto';


/** End points related to the admin */
@ApiTags('ADMIN')
@Controller('admin')
@Auth(AuthType.Admin)
export class AdminController {

    /** Inject the dependencies */
    constructor(
        /** Inject the Admin Service */
        private readonly adminService: AdminService
    ) { }

    @Patch()
    @ApiOperation({ summary: 'sets the token' })
    @HttpCode(HttpStatus.OK)
    @ApiResponse({ status: HttpStatus.OK, description: 'User updated' })
    @ApiResponse({ status: HttpStatus.UNAUTHORIZED, description: "You aren't authorized" })
    update(
        @CurrentUser() userInfo: CurrentUserData,
        @Body() setAdminTokenDto: SetAdminTokenDto
    ) {
        return this.adminService.setToken(userInfo, setAdminTokenDto);
    }
}