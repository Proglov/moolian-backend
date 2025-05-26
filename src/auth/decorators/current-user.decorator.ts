import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User } from "src/users/user.schema";

//extracts the User
export const CurrentUser = createParamDecorator<ExecutionContext, Pick<User, "_id">>(
    (_data: unknown, ctx: ExecutionContext) => ctx.switchToHttp().getRequest().user
)