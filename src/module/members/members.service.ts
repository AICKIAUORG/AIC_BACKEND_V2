import { BadRequestException, ConflictException, Inject, Injectable, InternalServerErrorException, NotFoundException, Scope } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberEntity } from "./entities/members.entity";
import { ConfirmDto, DocumentDto, MemberSearchDto, UpdateMemberDto } from "./dto/document.dto";
import { REQUEST } from "@nestjs/core";
import { Request } from "express";
import { UploadFileS3 } from "src/common/interceptors/upload-file.interceptor";
import { S3Service } from "../S3/s3.service";
import { DocumentEntity } from "./entities/document.entity";
import { AuthService } from "src/auth/auth.service";
import { PaginationDto } from "src/common/dto/pagination.dto";
import { paginationSolver, DateConvertor, PaginationGenerator } from "src/common/utility/function.utils";
import { StatusEnum } from "src/common/enums/status.enum";
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

    async submitMember(documentDto : DocumentDto, resume : Express.Multer.File | undefined, studentCard_image : Express.Multer.File) {
        const {skills, national_code, student_number, entry_year, gender, GPA, description} = documentDto
        let resumeLocation : string;
        let resumeKey : string;
        if(this.req.user.membership) throw new ConflictException('شما قبلا ثبت نام کرده اید')
        await this.checkDocumentExist(national_code, student_number)
        const member = this.membersRepository.create({user_id : this.req.user.id})
        const {id} = await this.membersRepository.save(member)
        const document = this.documentRepository.create({
            member_id : id,
            national_code,
            student_number,
            skills,
            description,
            entry_year,
            gender,
            GPA
        })
        if(resume){
            const {Location , Key} = await this.s3service.uploadFile(resume,`AIC/members/document${this.req.user.id}`)
            resumeLocation = Location;
            resumeKey = Key;
            document.resume = {location : resumeLocation, key : resumeKey}
        }
        const {Location : cardLocation, Key : cardKey} = await this.s3service.uploadFile(studentCard_image,`AIC/members/document${this.req.user.id}`)
        document.studentCard_image = {location : cardLocation, key : cardKey}
        await this.documentRepository.save(document)
        const {accessToken, refreshToken} = this.authService.TokenGenerator({id : this.req.user.id, mobile : this.req.user.mobile, membership : true, token_version : this.req.user.token_version + 1})
        await this.membersRepository.manager.getRepository("users").update(
            { id : this.req.user.id},
            { token_version: this.req.user.token_version + 1 }
        );
        return {
            message : "member submitted successfully",
            accessToken,
            refreshToken
        }
        
    }

    async findDocById(document_id : number){
        const document = await this.documentRepository.findOne({
            where : {id : document_id},
            relations: ["reviewedBy"],
            select: {
                reviewedBy: {
                    first_name: true,
                    last_name: true
                }
            },
        })
        if(!document) throw new NotFoundException('کاربر یافت نشد')
        document.created_at = DateConvertor(document.created_at.toString(), false)
        document.updated_at = DateConvertor(document.updated_at.toString(), false)
        return document
    }

    async checkDocumentExist(national_code? : string, student_number? :string){
        if(national_code){
            const member = await this.documentRepository.findOne({
                where : {national_code}})
                if(member) throw new ConflictException('کاربر با این کد ملی قبلا ثبت نام کرده است')
        }
        if(student_number){
            const member = await this.documentRepository.findOne({where : {student_number}})
            if(member) throw new ConflictException('کاربر با این شماره دانشجویی قبلا ثبت نام کرده است')
        }
    }

    async findMemberById(id : number){
        const member = await this.membersRepository.findOne({
            where : {id},
            relations : {
                user : true,
                role : true,
                department : true,
                document : true,
                permissions : true,
            },
            select : {
                user : {first_name : true, last_name : true},
                role : {code : true, role : true},
                department : {id : true, name : true},
                document : {id : true, status : true},
                permissions : {code : true, access : true},
            }  
        })
        if(!member) throw new NotFoundException('کاربر یافت نشد')
        member.created_at = DateConvertor(member.created_at, false)
        member.updated_at = DateConvertor(member.updated_at, false)
        return member
    }

    async findMembers(paginationDto: PaginationDto, searchDto: MemberSearchDto) {
        const { search, mobile, from_date, to_date, end_GPA, GPA, entry, status, end_entry, gender, national_code, skills ,start_GPA, start_entry, student_number } = searchDto;
        const { page, limit, skip } = paginationSolver(paginationDto);
        const query = this.membersRepository.createQueryBuilder("members");
        query.leftJoinAndSelect("members.document", "document");
        query.leftJoinAndSelect("members.user", "user");
    
        if (status) {
          query.andWhere("document.status = :status", { status });
        }
        if (mobile) {
          query.andWhere("user.mobile = :mobile", { mobile });
        }
        if (national_code) {
            query.andWhere("document.national_code = :national_code", { national_code });
        }
        if (gender) {
            query.andWhere("document.gender = :gender", { gender });
        }
        if (student_number) {
            query.andWhere("document.student_number = :student_number", { student_number });
        }
        if (skills && skills.length > 0) {
            query.andWhere("document.skills && :skills", { skills });
        }

        if(GPA){
            query.andWhere("document.GPA = :GPA", { GPA });
        }else{
            if (start_GPA && end_GPA) {
                query.andWhere("document.GPA BETWEEN :start_GPA AND :end_GPA", { start_GPA, end_GPA });
            } else if (start_GPA) {
                query.andWhere("document.GPA >= :start_GPA", { start_GPA });
            } else if (end_GPA) {
                query.andWhere("document.GPA <= :end_GPA", { end_GPA });
            }
        }
        
        if(entry){
            query.andWhere("document.entry_year = :entry", { entry });
        }else{
            if (start_entry && end_entry) {
                query.andWhere("document.entry_year BETWEEN :start_entry AND :end_entry", { start_entry, end_entry });
            } else if (start_entry) {
                query.andWhere("document.entry_year >= :start_entry", { start_entry });
            } else if (end_entry) {
                query.andWhere("document.entry_year <= :end_entry", { end_entry });
            }
        }
        
        if (
          to_date &&
          from_date
        ) {
          const to = new Date(DateConvertor(to_date))
          const from = new Date(DateConvertor(from_date))
          query.andWhere("members.created_at BETWEEN :from AND :to", { from, to });
        } else if (from_date) {
          const from = new Date(DateConvertor(from_date))
          query.andWhere("members.created_at >= :from", { from });
        } else if (to_date) {
          const to = new Date(DateConvertor(to_date))
          query.andWhere("members.created_at <= :to", { to });
        }
        if (search && search.length >= 3) {
          query.andWhere(
            "user.first_name LIKE :search OR user.last_name LIKE :search",
            { search: `%${search}%` }
          );
        } else if (search && search.length < 3) {
          throw new BadRequestException(
            "تعداد کاراکتر های سرچ نمیتواند کمتر از ۳ کاراکتر باشد."
          );
        }
        
        query.select([
            "members.id",
            "document.id",
            "user.id",
            "user.first_name",
            "user.last_name", 
            "user.mobile", 
            "document.student_number",
            "document.national_code",
            "document.status",
            "members.created_at"
        ]);
        query.take(limit);
        query.skip(skip);
        query.orderBy("members.created_at", "DESC");
        const [members, count] = await query.getManyAndCount();
    
        if (members.length == 0) throw new NotFoundException("نتیحه ای یافت نشد.");
        const simplifiedMembers = members.map(member => ({
            member_id: member.id,
            user_id : member.user.id,
            document_id : member.document.id,
            first_name: member.user.first_name,
            last_name: member.user.last_name,
            mobile : member.user.mobile,
            student_number: member.document.student_number,
            national_code: member.document.national_code,
            document_status: member.document.status,
            created_at: DateConvertor(member.created_at, false)
        }));
        
        return {
          pagination: PaginationGenerator(page, limit, count),
          members: simplifiedMembers,
        };
      }

    async update(updateDto : UpdateMemberDto, resume : Express.Multer.File, profile_photo : Express.Multer.File) {  
    const { description, skills } = updateDto;    
    const member = await this.findMemberById(this.req.user.id)

    if(!member?.document?.id) 
        throw new NotFoundException('اطلاعات کاربر یافت نشد،')
    if(description && description.length > 0){
        member.document.description = description
    }
    if(skills && skills.length > 0){
        member.document.skills = skills
    }
    if(resume){
        const { Key, Location } = await this.s3service.uploadFile(resume, `AIC/members/document${this.req.user.id}`)
        member.document.resume = {location : Location, key : Key}
    }
    if(profile_photo){
        const { Key, Location } = await this.s3service.uploadFile(profile_photo, `AIC/members/document${this.req.user.id}`)
        member.document.profile_photo = {location : Location, key : Key}
    }

    await this.documentRepository.save(member.document);
    return {
        message : "اطلاعات کاربر با موفقیت اپدیت شد."
    }
    }

    async changeStatus(confirmDto : ConfirmDto){
        const { reason, status, document_id } = confirmDto;
        const  document = await this.documentRepository.findOneBy({id : +document_id})
        if(!document) 
            throw new NotFoundException('داده ای یافت نشد.')
        if(status === document.status){
            return {
                message : `وضعیت داکیومنت ${status} میباشد`
            }
        }
        if(status == StatusEnum.reject && !reason)
            throw new BadRequestException('برای رد صحلاحیت باید دلیل وارد کنید')
        document.status = status;
        document.reason = reason;
        document.reviewedById = this.req.user.id;
        await this.documentRepository.save(document)
        return {
            message : `وضعیت کاربر به ${status} تغییر کرد`
        }
    }
}

