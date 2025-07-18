import { CommissionEntity } from "src/module/commissions/entities/commission.entity";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("departments")
export class DepartmentEntity {
    @PrimaryGeneratedColumn()
    id : number
    @Column()
    name :string
    @Column()
    commission_id :number
    @Column()
    head_id :number
    @OneToOne(() => MemberEntity, {nullable : true , onDelete : "SET NULL"})
    @JoinColumn({name : "head_id"})
    head : MemberEntity
    @OneToMany(() => MemberEntity, (member) => member.department,{nullable: true})
    members : MemberEntity[]
    @ManyToOne(() => CommissionEntity, (commission) => commission.departments)
    @JoinColumn({name : "commission_id"})
    commission : CommissionEntity
    @CreateDateColumn({type : "time with time zone"})
    created_at: string;
    @UpdateDateColumn({type : "time with time zone"})
    updated_at: Date;
}