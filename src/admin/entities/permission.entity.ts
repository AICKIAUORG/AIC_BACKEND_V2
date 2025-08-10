import { Column, CreateDateColumn, Entity, ManyToMany, PrimaryColumn, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { accessEnum, permissionEnum } from "src/common/enums/role.enum";
import { MemberEntity } from "src/module/members/entities/members.entity";

@Entity("permissions")
export class PermissionEntity {
    @PrimaryColumn()
    code: number;
    @Column({type : "enum", enum: permissionEnum})
    permission : string;
    @Column({type : "enum", enum: accessEnum})
    access : string 
    @ManyToMany(() => MemberEntity, (member) => member.permissions)
    members: MemberEntity[];
    @CreateDateColumn({type : "timestamptz"})
    created_at: Date;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
    
}
