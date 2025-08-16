import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MemberEntity } from "./members.entity";
import { skillEnum } from "src/common/enums/skill.enum";
import { StatusEnum } from "src/common/enums/status.enum";
import { UserEntity } from "src/module/users/entities/user.entity";

@Entity("documents")
export class DocumentEntity {
    @PrimaryGeneratedColumn()
    id : number
    @Column({nullable : true})
    member_id: number;
    @Column({unique : true})
    national_code: string
    @Column({unique : true})
    student_number: string
    @Column({nullable : true, type : "enum", array : true, enum : skillEnum, enumName: "skill_enum"})
    skills: string[]
    @Column({ nullable: true, type: "jsonb" })
    profile_photo: { location: string, key: string }
    @Column({ nullable: true, type: "jsonb" })
    resume: { location: string, key: string }
    @Column({type : 'jsonb'})
    studentCard_image: { location: string, key: string }
    @Column({type : "enum", enum : {Male : "male", Female : "female"}})
    gender: string
    @Column({ type: "decimal", precision: 4, scale: 2})
    GPA: number
    @Column({nullable : true})
    description: string
    @Column({enum : StatusEnum, type : "enum", default : StatusEnum.pending, enumName: "status_enum"})
    status: string
    @Column({nullable : true})
    reason: string
    @Column({ nullable: true })
    reviewedById: number;
    @OneToOne(() => UserEntity, { nullable: true })
    @JoinColumn({ name: "reviewedById" })
    reviewedBy: UserEntity;
    @Column()
    entry_year: number
    @OneToOne(() => MemberEntity, (member) => member.document, {onDelete : 'CASCADE'})
    @JoinColumn({name: "member_id"})
    member : MemberEntity; 
    @CreateDateColumn({type : "timestamptz"})
    created_at: Date;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
}