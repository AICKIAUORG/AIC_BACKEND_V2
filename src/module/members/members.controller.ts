import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { MembersService } from "./members.service";
import { ApiConsumes, ApiQuery, ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { UserAuth } from "src/common/decorators/auth.decorator";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { DocumentDto } from "./dto/document.dto";
import { skillEnum } from "src/common/enums/skill.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";

@Controller("members")
@ApiTags("Members")
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @UserAuth()
    @ApiOperation({ summary: 'ثبت نام عضو جدید', description: 'ثبت نام عضو جدید با آپلود فایل‌های مورد نیاز' })
    @ApiConsumes(SwaggerEnums.Multipart)
    @ApiBody({
        type: DocumentDto,
        description: 'اطلاعات عضو جدید',
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'resume', maxCount: 1 },
            { name: 'studentCard_image', maxCount: 1 }
        ], {
            storage: memoryStorage(),
            limits: {
                fileSize: 10 * 1024 * 1024, // 10MB limit
            },
        })
    )
    @Post()
    submit(
        @Body() documentDto: DocumentDto,
        @UploadedFiles() files: { resume?: Express.Multer.File[], studentCard_image?: Express.Multer.File[] }
    ) {
        // Validate resume file if provided
        if (files.resume && files.resume[0]) {
            const resume = files.resume[0];
            if (resume.size > 10 * 1024 * 1024) {
                throw new BadRequestException('Resume file size must be less than 10MB');
            }
            if (!resume.mimetype.includes('pdf')) {
                throw new BadRequestException('Resume must be a PDF file');
            }
        }

        // Validate student card image (required)
        if (!files.studentCard_image || !files.studentCard_image[0]) {
            throw new BadRequestException('Student card image is required');
        }
        
        const studentCard = files.studentCard_image[0];
        if (studentCard.size > 10 * 1024 * 1024) {
            throw new BadRequestException('Student card image size must be less than 10MB');
        }
        
        const allowedImageTypes = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'];
        if (!allowedImageTypes.includes(studentCard.mimetype)) {
            throw new BadRequestException('Student card image must be PNG, JPG, JPEG, or WebP');
        }

        return this.membersService.submitMember(
            documentDto, 
            files.resume?.[0], 
            files.studentCard_image[0]
        );
    }
}
