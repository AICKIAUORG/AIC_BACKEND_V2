import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AdminEntity } from "./admin.entity";

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
    
}
