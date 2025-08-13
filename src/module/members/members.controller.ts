import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Post, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { MembersService } from "./members.service";
import { ApiConsumes, ApiQuery, ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { UserAuth } from "src/common/decorators/auth.decorator";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { DocumentDto, MemberSearchDto } from "./dto/document.dto";
import * as moment from 'moment-jalaali';
import { skillEnum } from "src/common/enums/skill.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";

@Controller("members")
@ApiTags("Members")
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get()
    @ApiOperation({
        summary: "Search members",
        description: "Search and filter members with various options",
    })
    @ApiResponse({
        status: 200,
        description: "When members are found",
        schema: {
        example: {
            pagination: {
            total_count: 25,
            page: 0,
            limit: 10,
            skip: 0,
            },
            members: [
            {
                id: 1,
                first_name: "پویا",
                last_name: "عباداللهی",
                mobile: "09196715197",
                student_number: "401234567",
                national_code: "1234567890",
                document_status: "pending"
            },
            {
                id: 2,
                first_name: "علی",
                last_name: "احمدی",
                mobile: "09123456789",
                student_number: "401234568",
                national_code: "1234567891",
                document_status: "accepted"
            }
            ],
        },
        },
    })
    @ApiResponse({
        status: 400,
        description: "When input parameters are invalid",
        schema: {
        example: {
            message: "تعداد کاراکتر های سرچ نمیتواند کمتر از ۳ کاراکتر باشد.",
            error: "Bad Request",
            statusCode: 400,
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: "When no results are found",
        schema: {
        example: {
            message: "نتیحه ای یافت نشد.",
            error: "Not Found",
            statusCode: 404,
        },
        },
    })
    find(
        @Query() searchDto: MemberSearchDto
    ) {
        const paginationDto = {limit : searchDto.limit, page : searchDto.page}
        return this.membersService.findMembers(paginationDto, searchDto);
    }

    @UserAuth()
    @ApiOperation({ summary: 'Register new member', description: 'Register new member with required file uploads' })
    @ApiConsumes(SwaggerEnums.Multipart)
    @ApiResponse({
        status: 200,
        description: "When member registration is successful",
        schema: {
            example: {
                "message": "member submitted successfully",
                "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibW9iaWxlIjoiMDkxOTY3MTUxOTciLCJtZW1iZXJzaGlwIjp0cnVlLCJ0b2tlbl92ZXJzaW9uIjo1LCJpYXQiOjE3NTUwOTY1NDUsImV4cCI6MTc1NzY4ODU0NX0.Wc_pZG5NSUNRWmus1I9FGd9KCBV9J9kmxafqhzfMOSM",
                "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MywibW9iaWxlIjoiMDkxOTY3MTUxOTciLCJtZW1iZXJzaGlwIjp0cnVlLCJ0b2tlbl92ZXJzaW9uIjo1LCJpYXQiOjE3NTUwOTY1NDUsImV4cCI6MTc4NjY1NDE0NX0.88GYm5YqgqT7e-r1g1S33mc8EV46DZ1EPsO5hywbW6k"
            },
        },
    })
    @ApiResponse({
    status: 409,
    description: "When user has already submitted registration",
    schema: {
        example: {
            "message": "شما قبلا ثبت نام کرده اید",
            "error": "Conflict",
            "statusCode": 409
        },
    },
    })
    @ApiBody({
        type: DocumentDto,
        description: 'New member information',
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
        if(documentDto.entry_year > moment().jYear()){
            throw new BadRequestException('سال ورودی را به درستی وارد کنید')
        }
        if (files.resume && files.resume[0]) {
            const resume = files.resume[0];
            if (resume.size > 10 * 1024 * 1024) {
                throw new BadRequestException('Resume file size must be less than 10MB');
            }
            if (!resume.mimetype.includes('pdf')) {
                throw new BadRequestException('Resume must be a PDF file');
            }
        }

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
