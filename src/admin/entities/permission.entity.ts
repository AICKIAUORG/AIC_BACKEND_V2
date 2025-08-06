import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { AdminEntity } from "./admin.entity";
import { accessEnum, permissionEnum } from "src/common/enums/role.enum";

@Entity("permissions")
export class PermissionEntity {
    @PrimaryGeneratedColumn()
    id: number;
    @Column({enum: permissionEnum})
    permission : string;
    @Column()
    admin_id : number
    @Column({enum: accessEnum})
    access : string 
    @ManyToOne(() => AdminEntity, (admin) => admin.permissions, {onDelete: "CASCADE"})
    @JoinColumn({name: "admin_id"})
    admin: AdminEntity;
    @CreateDateColumn({type : "timestamptz"})
    created_at: string;
    @UpdateDateColumn({type : "timestamptz"})
    updated_at: Date;
    
}
