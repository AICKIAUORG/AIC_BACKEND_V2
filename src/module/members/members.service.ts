import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberEntity } from "./entities/members.entity";
import { DocumentDto } from "./dto/document.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { UploadFileS3 } from "src/common/interceptors/upload-file.interceptor";
import { S3Service } from "../S3/s3.service";
import { DocumentEntity } from "./entities/document.entity";
import { AuthService } from "src/auth/auth.service";
@Injectable({scope : Scope.REQUEST})
export class MembersService {
    constructor(
        @InjectRepository(MemberEntity)
        private readonly membersRepository: Repository<MemberEntity>,
        @InjectRepository(DocumentEntity)
        private readonly documentRepository: Repository<DocumentEntity>,
        @Inject(REQUEST)
        private req : Request,
        private s3service : S3Service,
        private authService : AuthService
    ) {}

    async submitMember(documentDto : DocumentDto, resume : Express.Multer.File, studentCard_image : Express.Multer.File) {
        const {national_code, student_number, skills, entry_year, gender, GPA} = documentDto
        if(this.req.user.membership) throw new ConflictException('شما قبلا ثبت نام کرده اید')
        await this.checkExist(national_code, student_number)
        const member = this.membersRepository.create({user_id : this.req.user.id})
        const document = this.documentRepository.create({
            member_id : member.id,
            national_code,
            student_number,
            skills,
            entry_year,
            gender,
            GPA
        })
        const {Location : resumeLocation, Key : resumeKey} = await this.s3service.uploadFile(resume,`members/document${this.req.user.id}`)
        const {Location : cardLocation, Key : cardKey} = await this.s3service.uploadFile(studentCard_image,`members/document${this.req.user.id}`)
        document.resume = {location : resumeLocation, key : resumeKey}
        document.studentCard_image = {location : cardLocation, key : cardKey}
        Promise.all([
            this.membersRepository.save(member),
            this.documentRepository.save(document)
        ])
        const {accessToken, refreshToken} = this.authService.TokenGenerator({id : this.req.user.id, mobile : this.req.user.mobile, membership : true})
        return {
            message : "member submitted successfully",
            accessToken,
            refreshToken
        }
        
    }

    async checkExist(national_code? : string, student_number? :string){
        if(national_code){
            const member = await this.membersRepository.findOne({where : {document : {national_code}}})
            if(member) throw new ConflictException('کاربر با این کد ملی قبلا ثبت نام کرده است')
        }
        if(student_number){
            const member = await this.membersRepository.findOne({where : {document : {student_number}}})
            if(member) throw new ConflictException('کاربر با این شماره دانشجویی قبلا ثبت نام کرده است')
        }
        throw new InternalServerErrorException('internal error')
    }
}
