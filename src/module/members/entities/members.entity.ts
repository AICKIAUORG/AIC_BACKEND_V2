import { AdminEntity } from "src/admin/entities/admin.entity";
import { DepartmentEntity } from "src/module/departments/entities/department.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, ManyToOne, JoinColumn, UpdateDateColumn, CreateDateColumn, ManyToMany, JoinTable, Index } from "typeorm";
import { DocumentEntity } from "./document.entity";
import { UserEntity } from "src/module/users/entities/user.entity";
import { PermissionEntity } from "src/admin/entities/permission.entity";

@Entity("members")
@Index(['user_id'])
@Index(['department_id'])
@Index(['created_at'])
@Index(['user_id', 'department_id'])
export class MemberEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    user_id : number;
    @Column({nullable : true})
    department_id: number;
    @Column({default : 0})
    points: number;
    @CreateDateColumn({type : "timestamptz"})
    created_at: Date;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
    @OneToOne(() => UserEntity, (user) => user.membership, {onDelete: "CASCADE"})
    @JoinColumn({name: "user_id"})
    user: UserEntity;
    @OneToOne(() => AdminEntity, (admin) => admin.member, {nullable: true, onDelete: "SET NULL"})
    role: AdminEntity;
    @OneToOne(() => DocumentEntity, (document) => document.member, {onDelete : "CASCADE"})
    document: DocumentEntity;
    @ManyToOne(() => DepartmentEntity, (department) => department.members, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "department_id"})
    department: DepartmentEntity;
    @ManyToMany(() => PermissionEntity, (permission) => permission.members)
    @JoinTable({
        name: 'member_permissions',
        joinColumn: { name: 'member_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'permission_code', referencedColumnName: 'code' }
    })
    permissions: PermissionEntity[];
}