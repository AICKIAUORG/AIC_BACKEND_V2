import { AdminEntity } from "src/admin/entities/admin.entity";
import { CommissionEntity } from "src/module/commissions/entities/commission.entity";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("departments")
export class  DepartmentEntity {
    @PrimaryGeneratedColumn()
    id : number
    @Column()
    name :string
    @Column()
    commission_id: number
    @Column()
    code : number
    @OneToOne(() => AdminEntity)
    @JoinColumn({name : "code"})
    role : AdminEntity
    @OneToMany(() => MemberEntity, (member) => member.department,{nullable: true})
    members : MemberEntity[]
    @ManyToOne(() => CommissionEntity, (commission) => commission.departments,{onDelete : "CASCADE"})
    @JoinColumn({name : "commission_id"})
    commission : CommissionEntity 
    @CreateDateColumn({type : "timestamptz"})
    created_at: Date;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
} 