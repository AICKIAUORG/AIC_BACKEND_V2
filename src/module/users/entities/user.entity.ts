import { role } from "src/common/enums/role.enum";
import { MemberEntity } from "src/module/members/entities/members.entity";
import { Column, CreateDateColumn, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn, } from "typeorm";

@Entity('users')
export class UserEntity {
  @PrimaryGeneratedColumn("increment")
  id: number;
  @Column({ nullable : true })
  first_name: string;
  @Column({ nullable : true })
  last_name: string;
  @Column({ unique: true })
  mobile: string;
  @Column({ unique: true , nullable : true })
  email: string;
  @Column({ nullable : true })
  password: string;
  @Column({ default: false })
  mobile_verify: boolean;
  @Column({ default: 0 })
  token_version: number;
  @OneToOne(() => MemberEntity, (member) => member.user, {nullable : true, onDelete : "SET NULL"})
  membership: MemberEntity;
  @Column({ nullable: true })
  otp: string;
  @Column({ nullable: true })
  expires_in: Date;
  @CreateDateColumn({type : "timestamptz"})
  created_at: string;
  @UpdateDateColumn({type : "timestamptz"})
  updated_at: Date;
}
 