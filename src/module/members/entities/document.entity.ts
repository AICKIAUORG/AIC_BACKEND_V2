import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { MemberEntity } from "./members.entity";
import { skillEnum } from "src/common/enums/skill.enum";

@Entity("document")
export class DocumentEntity {
    @PrimaryGeneratedColumn()
    id : number
    @Column({unique : true})
    national_code: string
    @Column({unique : true})
    student_number: string
    @Column({nullable : true, enum : skillEnum})
    skills: string[]
    @Column({nullable : true})
    resume: string
    @Column()
    entry_year: string
    @Column()
    member_id: number
    @OneToOne(() => MemberEntity, (member) => member.department, {onDelete : "CASCADE"})
    @JoinColumn({name : "member_id"})
    member : MemberEntity; 
}