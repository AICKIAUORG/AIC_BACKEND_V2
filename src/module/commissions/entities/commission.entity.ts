import { DepartmentEntity } from "src/module/departments/entities/department.entity";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity("commissions")
export class CommissionEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    name : string
    @Column()
    head_id : number
    @Column()
    department_id : number
    @OneToOne(() => MemberEntity, {nullable : true})
    @JoinColumn({name : "head_id"})
    head : MemberEntity
    @OneToMany(() => DepartmentEntity, (department) => department.commission, {nullable : true, onDelete : "SET NULL"})
    @JoinColumn({name : "department_id"})
    departments : DepartmentEntity[]
    @CreateDateColumn({type : "time with time zone"})
    created_at: string;
    @UpdateDateColumn({type : "time with time zone"})
    updated_at: Date;
}