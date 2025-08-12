import { Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, UploadedFile, UseInterceptors } from "@nestjs/common";
import { MembersService } from "./members.service";
import { ApiConsumes, ApiTags } from "@nestjs/swagger";
import { UserAuth } from "src/common/decorators/auth.decorator";
import { UploadFileS3 } from "src/common/interceptors/upload-file.interceptor";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { DocumentDto } from "./dto/document.dto";

@Controller("members")
@ApiTags("Members")
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @UserAuth()
    @ApiConsumes(SwaggerEnums.Multipart)
    @UseInterceptors(
        UploadFileS3('resume'),
        UploadFileS3('studentCard_image')
    )
    @Post()
    submit(
        @Body() documentDto: DocumentDto,
        @UploadedFile('resume',
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: "application/pdf" }),
                ],
            })
        )
        resume: Express.Multer.File,
        @UploadedFile('studentCard_image',
            new ParseFilePipe({
                validators: [
                    new MaxFileSizeValidator({ maxSize: 10 * 1024 * 1024 }),
                    new FileTypeValidator({ fileType: "image/(png|jpg|jpeg|webp)" }),
                ],
            })
        )
        studentCard_image: Express.Multer.File

    ) {
        return this.membersService.submitMember(documentDto, resume, studentCard_image);
    }
}
