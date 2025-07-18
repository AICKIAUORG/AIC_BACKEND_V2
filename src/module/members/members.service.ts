import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { MemberEntity } from "./entities/member.entity";

@Injectable()
export class MembersService {
    constructor(
        @InjectRepository(MemberEntity)
        private readonly membersRepository: Repository<MemberEntity>,
    ) {}

    async findAll() {
        return this.membersRepository.find();
    }
}
