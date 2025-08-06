import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MemberEntity } from "./members.entity";
import { skillEnum } from "src/common/enums/skill.enum";
import { StatusEnum } from "src/common/enums/status.enum";

@Entity("document")
export class DocumentEntity {
    @PrimaryGeneratedColumn()
    id : number
    @Column({unique : true})
    national_code: string
    @Column({unique : true})
    student_number: string
    @Column({nullable : true, type : "enum", array : true, enum : skillEnum, enumName: "skill_enum"})
    skills: string[]
    @Column({nullable : true})
    resume: string
    @Column({enum : StatusEnum, type : "enum", default : StatusEnum.pending, enumName: "status_enum"})
    status: string
    @Column({nullable : true})
    reason: string
    @Column()
    reviewedBy: string
    @Column()
    entry_year: string
    @Column()
    member_id: number
    @OneToOne(() => MemberEntity, (member) => member.department, {onDelete : "CASCADE"})
    @JoinColumn({name : "member_id"})
    member : MemberEntity; 
}