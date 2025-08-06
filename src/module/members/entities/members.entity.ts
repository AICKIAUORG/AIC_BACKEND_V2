import { AdminEntity } from "src/admin/entities/admin.entity";
import { DepartmentEntity } from "src/module/departments/entities/department.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn } from "typeorm";
import { DocumentEntity } from "./document.entity";
import { UserEntity } from "src/module/users/entities/user.entity";

@Entity("members")
export class MemberEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    user_id
    @Column({nullable : true})
    role_id: number;
    @Column({nullable : true})
    document_id: number;
    @Column({nullable : true})
    department_id: number;
    @OneToOne(() => UserEntity, (user) => user.membership, {onDelete: "CASCADE"})
    @JoinColumn({name: "user_id"})
    user: UserEntity;
    @OneToOne(() => AdminEntity, (admin) => admin.member, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "role_id"})
    role: AdminEntity;
    @OneToOne(() => DocumentEntity, (document) => document.member, {nullable: true})
    @JoinColumn({name: "document_id"})
    document: DocumentEntity;
    @ManyToOne(() => DepartmentEntity, (department) => department.members, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "department_id"})
    department: DepartmentEntity;
    @CreateDateColumn({type : "timestamptz"})
    created_at: string;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
}