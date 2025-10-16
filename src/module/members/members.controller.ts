import { BadRequestException, Body, Controller, FileTypeValidator, Get, MaxFileSizeValidator, ParseFilePipe, Patch, Post, Put, Query, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { MembersService } from "./members.service";
import { ApiConsumes, ApiQuery, ApiTags, ApiOperation, ApiBody, ApiResponse } from "@nestjs/swagger";
import { UserAuth } from "src/common/decorators/auth.decorator";
import { SwaggerEnums } from "src/common/enums/swagger.enum";
import { ConfirmDto, DocumentDto, MemberSearchDto, UpdateMemberDto } from "./dto/members.dto";
import * as moment from 'moment-jalaali';
import { FileFieldsInterceptor } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { toMG } from "src/common/utility/function.utils";
import { validateFiles } from "src/common/utility/file.utils";

@Controller("members")
@ApiTags("Members")
export class MembersController {
    constructor(private readonly membersService: MembersService) {}

    @Get("/search")
    @ApiOperation({
        summary: "Search members",
        description: "Search and filter members with various options"
    })
    @ApiResponse({
        status: 200,
        description: "Members found successfully",
        schema: {
            type: 'object',
            properties: {
                pagination: {
                    type: 'object',
                    properties: {
                        total_count: { type: 'number', example: 25 },
                        page: { type: 'number', example: 0 },
                        limit: { type: 'number', example: 10 },
                        skip: { type: 'number', example: 0 }
                    }
                },
                members: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            member_id: { type: 'number', example: 1 },
                            user_id: { type: 'number', example: 1 },
                            document_id: { type: 'number', example: 1 },
                            first_name: { type: 'string', example: 'پویا' },
                            last_name: { type: 'string', example: 'عباداللهی' },
                            mobile: { type: 'string', example: '09196715197' },
                            student_number: { type: 'string', example: '401234567' },
                            national_code: { type: 'string', example: '1234567890' },
                            document_status: { type: 'string', example: 'pending' }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: "Invalid input parameters",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'تعداد کاراکتر های سرچ نمیتواند کمتر از ۳ کاراکتر باشد.' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: "No results found",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'نتیحه ای یافت نشد.' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
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
        description: "Get document details by document ID"
    })
    @ApiResponse({
        status: 200,
        description: "Document found successfully",
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                member_id: { type: 'number', example: 1 },
                national_code: { type: 'string', example: '1234567890' },
                student_number: { type: 'string', example: '401234567' },
                skills: { type: 'array', items: { type: 'string' }, example: ['programming', 'design'] },
                description: { type: 'string', example: 'توضیحات کاربر' },
                entry_year: { type: 'number', example: 1402 },
                gender: { type: 'string', example: 'male' },
                GPA: { type: 'number', example: 18.5 },
                status: { type: 'string', example: 'pending' },
                resume: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', example: 'https://example.com/resume.pdf' },
                        key: { type: 'string', example: 'AIC/members/document1/resume.pdf' }
                    }
                },
                studentCard_image: {
                    type: 'object',
                    properties: {
                        location: { type: 'string', example: 'https://example.com/card.jpg' },
                        key: { type: 'string', example: 'AIC/members/document1/card.jpg' }
                    }
                },
                reviewedBy: {
                    type: 'object',
                    properties: {
                        first_name: { type: 'string', example: 'مدیر' },
                        last_name: { type: 'string', example: 'سیستم' }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: "Document not found",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'کاربر یافت نشد' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    })
    getDocument(
        @Query('document_id') document_id: string
    ) {
        return this.membersService.findDocById(+document_id);
    }

    @Get("member")
    @ApiOperation({
        summary: "Get member by ID",
        description: "Get member details with relations by member ID"
    })
    @ApiResponse({
        status: 200,
        description: "Member found successfully",
        schema: {
            type: 'object',
            properties: {
                id: { type: 'number', example: 1 },
                user_id: { type: 'number', example: 1 },
                created_at: { type: 'string', example: '1404/07/24 19:44' },
                updated_at: { type: 'string', example: '1404/07/24 19:44' },
                user: {
                    type: 'object',
                    properties: {
                        first_name: { type: 'string', example: 'پویا' },
                        last_name: { type: 'string', example: 'عباداللهی' }
                    }
                },
                role: {
                    type: 'object',
                    properties: {
                        code: { type: 'string', example: 'MEMBER' },
                        role: { type: 'string', example: 'عضو' }
                    }
                },
                department: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        name: { type: 'string', example: 'برنامه‌نویسی' }
                    }
                },
                document: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', example: 1 },
                        status: { type: 'string', example: 'pending' }
                    }
                },
                permissions: {
                    type: 'array',
                    items: {
                        type: 'object',
                        properties: {
                            code: { type: 'string', example: 'READ' },
                            access: { type: 'boolean', example: true }
                        }
                    }
                }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: "Member not found",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'کاربر یافت نشد' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    })
    getMember(
        @Query('member_id') member_id: string
    ) {
        return this.membersService.findMemberById(+member_id);
    }


    @UserAuth()
    @ApiOperation({ 
        summary: 'Register new member', 
        description: 'Register new member with required file uploads' 
    })
    @ApiConsumes(SwaggerEnums.Multipart)
    @ApiResponse({
        status: 200,
        description: "Member registration successful",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'member submitted successfully' },
                accessToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
                refreshToken: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }
            }
        }
    })
    @ApiResponse({
        status: 409,
        description: "User has already submitted registration",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'شما قبلا ثبت نام کرده اید' },
                error: { type: 'string', example: 'Conflict' },
                statusCode: { type: 'number', example: 409 }
            }
        }
    })
    @ApiResponse({
        status: 409,
        description: "National code or student number already exists",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'کاربر با این کد ملی قبلا ثبت نام کرده است' },
                error: { type: 'string', example: 'Conflict' },
                statusCode: { type: 'number', example: 409 }
            }
        }
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
    @ApiOperation({ 
        summary: 'Update member', 
        description: 'Update member information and files' 
    })
    @ApiConsumes(SwaggerEnums.Multipart)
    @ApiResponse({
        status: 200,
        description: "Member update successful",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'اطلاعات کاربر با موفقیت اپدیت شد.' }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: "Member document not found",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'اطلاعات کاربر یافت نشد،' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
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
    @ApiOperation({ 
        summary: 'Confirm/Reject member document', 
        description: 'Change status of member document' 
    })
    @ApiConsumes(SwaggerEnums.UrlEncoded)
    @ApiResponse({
        status: 200,
        description: "Status change successful",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'وضعیت کاربر به accepted تغییر کرد' }
            }
        }
    })
    @ApiResponse({
        status: 200,
        description: "Status is already the same",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'وضعیت داکیومنت pending میباشد' }
            }
        }
    })
    @ApiResponse({
        status: 400,
        description: "Reject status provided without reason",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'برای رد صحلاحیت باید دلیل وارد کنید' },
                error: { type: 'string', example: 'Bad Request' },
                statusCode: { type: 'number', example: 400 }
            }
        }
    })
    @ApiResponse({
        status: 404,
        description: "Document not found",
        schema: {
            type: 'object',
            properties: {
                message: { type: 'string', example: 'داده ای یافت نشد.' },
                error: { type: 'string', example: 'Not Found' },
                statusCode: { type: 'number', example: 404 }
            }
        }
    })
    @Patch()
    confirm(
        @Body() confirmDto: ConfirmDto,
    ) {
        return this.membersService.changeStatus(confirmDto)
    }


}
