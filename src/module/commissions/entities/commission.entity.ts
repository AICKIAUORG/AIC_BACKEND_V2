import { DepartmentEntity } from "src/module/departments/entities/department.entity";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";

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
}