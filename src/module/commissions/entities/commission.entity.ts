import { AdminEntity } from 'src/admin/entities/admin.entity';
import { DepartmentEntity } from 'src/module/departments/entities/department.entity';
import { MemberEntity } from 'src/module/members/entities/members.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('commissions')
export class CommissionEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column()
  name: string;
  @Column()
  code: number;
  @OneToOne(() => AdminEntity)
  @JoinColumn({ name: 'code' })
  role: AdminEntity;
  @OneToMany(() => DepartmentEntity, (department) => department.commission, {
    nullable: true,
  })
  departments: DepartmentEntity[];
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
