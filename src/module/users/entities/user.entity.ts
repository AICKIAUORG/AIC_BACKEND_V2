import { role } from "src/common/enums/role.enum";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column()
  first_name: string;
  @Column()
  last_name: string;
  @Column({ unique: true })
  mobile: string;
  @Column({ unique: true })
  email: string;
  @Column()
  password: string;
  @Column({ default: false })
  mobile_verify: boolean;
  @OneToOne(() => MemberEntity, (member) => member.user, {nullable : true, onDelete : "SET NULL"})
  membership: MemberEntity;
  @CreateDateColumn({type : "time with time zone"})
  created_at: string;
  @UpdateDateColumn({type : "time with time zone"})
  updated_at: Date;
  @Column({ nullable: true })
  otp: string;
  @Column({ nullable: true })
  expires_in: Date;
}
 