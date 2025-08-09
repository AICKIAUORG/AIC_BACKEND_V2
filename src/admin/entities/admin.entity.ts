import { MemberEntity } from "src/module/members/entities/members.entity";
import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, OneToMany, CreateDateColumn, UpdateDateColumn, PrimaryColumn } from "typeorm";
import { PermissionEntity } from "./permission.entity";

@Entity("admins")
export class AdminEntity {
    @PrimaryColumn("numeric")
    code: number;
    @Column()
    role : string;
    @Column()
    member_id : number
    @Column({nullable : true})
    permission_id : number
    @OneToOne(() => MemberEntity, (member) => member.role, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "member_id"})
    member: MemberEntity;
    @OneToMany(() => PermissionEntity, (permission) => permission.admin, {nullable: true, onDelete: "SET NULL"})
    @JoinColumn({name: "permission_id"})
    permissions: PermissionEntity[];
    @CreateDateColumn({type : "timestamptz"})
    created_at: string;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
}