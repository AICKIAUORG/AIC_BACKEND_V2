import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Patch, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { MembersService } from "./members.service";
import { ApiConsumes, ApiQuery, ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { UserAuth } from "src/common/decorators/auth.decorator";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { ConfirmDto, DocumentDto, MemberSearchDto, UpdateMemberDto } from "./dto/document.dto";
import * as moment from 'moment-jalaali';
import { skillEnum } from "src/common/enums/skill.enum";
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { Pagination } from "src/common/decorators/pagination.decorator";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { UploadFileS3 } from "src/common/interceptors/upload-file.interceptor";
import { toMG } from "src/common/utility/function.utils";
import { validateFiles } from "src/common/utility/file.utils";

@Controller("members")
@ApiTags("Members")
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get("/search")
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
                member_id: 1,
                user_id: 1,
                document_id: 1,
                first_name: "پویا",
                last_name: "عباداللهی",
                mobile: "09196715197",
                student_number: "401234567",
                national_code: "1234567890",
                document_status: "pending"
            },
            {
                member_id: 2,
                user_id: 2,
                document_id: 2,
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
    
    @Get("document")
    @ApiOperation({
        summary: "Get document by ID",
        description: "Get document details by document ID",
    })
    @ApiResponse({
        status: 200,
        description: "When document is found",
        schema: {
        example: {
            id: 1,
            member_id: 1,
            national_code: "1234567890",
            student_number: "401234567",
            skills: ["programming", "design"],
            description: "توضیحات کاربر",
            entry_year: 1402,
            gender: "male",
            GPA: 18.5,
            status: "pending",
            resume: {
                location: "https://example.com/resume.pdf",
                key: "AIC/members/document1/resume.pdf"
            },
            studentCard_image: {
                location: "https://example.com/card.jpg",
                key: "AIC/members/document1/card.jpg"
            },
            reviewedBy: {
                first_name: "مدیر",
                last_name: "سیستم"
            }
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: "When document is not found",
        schema: {
        example: {
            message: "کاربر یافت نشد",
            error: "Not Found",
            statusCode: 404,
        },
        },
    })
    getDocument(
        @Query('document_id') document_id: string
    ) {
        return this.membersService.findDocById(+document_id);
    }

    @Get("member")
    @ApiOperation({
        summary: "Get member by ID",
        description: "Get member details with relations by member ID",
    })
    @ApiResponse({
        status: 200,
        description: "When member is found",
        schema: {
        example: {
            id: 1,
            user_id: 1,
            created_at: "1402/10/29 00:21",
            updated_at: "1402/10/29 00:21",
            user: {
                first_name: "پویا",
                last_name: "عباداللهی"
            },
            role: {
                code: "MEMBER",
                role: "عضو"
            },
            department: {
                id: 1,
                name: "برنامه‌نویسی"
            },
            document: {
                id: 1,
                status: "pending"
            },
            permissions: [
                {
                    code: "READ",
                    access: true
                }
            ]
        },
        },
    })
    @ApiResponse({
        status: 404,
        description: "When member is not found",
        schema: {
        example: {
            message: "کاربر یافت نشد",
            error: "Not Found",
            statusCode: 404,
        },
        },
    })
    getMember(
        @Query('member_id') member_id: string
    ) {
        return this.membersService.findMemberById(+member_id);
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
    @ApiResponse({
        status: 409,
        description: "When national code or student number already exists",
        schema: {
            example: {
                "message": "کاربر با این کد ملی قبلا ثبت نام کرده است",
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
                fileSize: toMG(10)
            },
        })
    )
    @Post()
    submit(
        @Body() documentDto: DocumentDto,
        @UploadedFiles() files: { 
            resume?: Express.Multer.File[],
            studentCard_image?: Express.Multer.File[] 
        }
    ) {
        if(documentDto.entry_year > moment().jYear()){
            throw new BadRequestException('سال ورودی را به درستی وارد کنید')
        }

        const validatedFiles = validateFiles(files, {
            resume: { maxSize: 10, allowedTypes: ['application/pdf'], required: false },
            studentCard_image: { maxSize: 10, allowedTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'], required: true }
        });

        return this.membersService.submitMember(
            documentDto, 
            validatedFiles.resume, 
            validatedFiles.studentCard_image
        );
    }

    @UserAuth()
    @ApiOperation({ summary: 'Update member', description: 'Update member information and files' })
    @ApiConsumes(SwaggerEnums.Multipart)
    @ApiResponse({
        status: 200,
        description: "When member update is successful",
        schema: {
            example: {
                "message": "اطلاعات کاربر با موفقیت اپدیت شد."
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: "When member document is not found",
        schema: {
            example: {
                "message": "اطلاعات کاربر یافت نشد،",
                "error": "Not Found",
                "statusCode": 404
            },
        },
    })
    @ApiBody({
        type: UpdateMemberDto,
        description: 'Updated member information',
    })
    @UseInterceptors(
        FileFieldsInterceptor([
            { name: 'resume', maxCount: 1 },
            { name: 'profile_photo', maxCount: 1 }
        ], {
            storage: memoryStorage(),
            limits: {
                fileSize: toMG(10)
            },
        })
    )
    @Put()
    update(
        @Body() updateDto: UpdateMemberDto,
        @UploadedFiles() files: {
             resume?: Express.Multer.File[],
             profile_photo?: Express.Multer.File[]
            }
    ) {
        const validatedFiles = validateFiles(files, {
            resume: { maxSize: 10, allowedTypes: ['application/pdf'], required: false },
            profile_photo: { maxSize: 10, allowedTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/webp'], required: true }
        });
        return this.membersService.update(updateDto, validatedFiles.resume, validatedFiles.profile_photo)
    }

    @UserAuth()
    @ApiOperation({ summary: 'Confirm/Reject member document', description: 'Change status of member document' })
    @ApiConsumes(SwaggerEnums.UrlEncoded)
    @ApiResponse({
        status: 200,
        description: "When status change is successful",
        schema: {
            example: {
                "message": "وضعیت کاربر به accepted تغییر کرد"
            },
        },
    })
    @ApiResponse({
        status: 200,
        description: "When status is already the same",
        schema: {
            example: {
                "message": "وضعیت داکیومنت pending میباشد"
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: "When reject status is provided without reason",
        schema: {
            example: {
                "message": "برای رد صحلاحیت باید دلیل وارد کنید",
                "error": "Bad Request",
                "statusCode": 400
            },
        },
    })
    @ApiResponse({
        status: 404,
        description: "When document is not found",
        schema: {
            example: {
                "message": "داده ای یافت نشد.",
                "error": "Not Found",
                "statusCode": 404
            },
        },
    })
    @Patch()
    confirm(
        @Body() confirmDto: ConfirmDto,
    ) {
        return this.membersService.changeStatus(confirmDto)
    }


}
