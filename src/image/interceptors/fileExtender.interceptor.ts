import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from "@nestjs/common";
import { Observable } from "rxjs";
import { badRequestException, validateDTO } from "src/common/errors";
import { UpdateImageDto } from "../dto/update-image.dto";


//? Because FileInterceptor removes body params, I used FileExtender interceptor, to pack filename in file properties.
@Injectable()
export class FileExtender implements NestInterceptor {
    async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
        const req = context.switchToHttp().getRequest();

        if (!req.file) {
            throw badRequestException('عکس الزامی میباشد');
        }

        const filename = req.body?.filename || ''

        await validateDTO(UpdateImageDto, { filename })

        req.file['filename'] = filename;

        return next.handle();
    }
}