import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { ActiveUserData } from "../interfacesAndType/active-user-data.interface";
import { REQUEST_USER_INFO_KEY } from "src/common/constants";

//extracts the User info key
export const ActiveUser = createParamDecorator(
    (field: keyof ActiveUserData | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        const user: ActiveUserData = request[REQUEST_USER_INFO_KEY]

        return field ? user?.[field] : user;
    }
)