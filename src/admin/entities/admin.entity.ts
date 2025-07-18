import { MemberEntity } from "src/module/members/entities/members.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn } from "typeorm";
import { PermissionEntity } from "./permission.entity";

@Entity("admins")
export class AdminEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column()
    role : string;
    @Column()
    member_id : number
    @Column()
    permission_id : number
    @OneToOne(() => MemberEntity, (member) => member.role, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "member_id"})
    member: MemberEntity;
    @OneToMany(() => PermissionEntity, (permission) => permission.admin, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "permission_id"})
    permissions: PermissionEntity[];
    @CreateDateColumn({type : "time with time zone"})
    created_at: string;
    @UpdateDateColumn({type : "time with time zone"})
    updated_at: Date;
}