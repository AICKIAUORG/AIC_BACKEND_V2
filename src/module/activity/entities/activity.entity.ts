import {
  ActivityStatusEnum,
  ActivityType,
  WarningTypeEnum,
} from 'src/common/enums/activity.enum';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { StatusEnum } from 'src/common/enums/status.enum';
import { MemberEntity } from 'src/module/members/entities/members.entity';

@Entity('activities')
@Index(['member_id', 'activity_type'])
@Index(['status', 'created_at'])
export class ActivityEntity {
  @PrimaryGeneratedColumn()
  id: number;
  @Column({
    type: 'enum',
    enum: [...Object.values(ActivityType), ...Object.values(WarningTypeEnum)],
  })
  activity_type: string;
  @Column({
    type: 'text',
  })
  description: string;
  @Column({
    type: 'enum',
    enum: ActivityStatusEnum,
    default: ActivityStatusEnum.pending,
  })
  status: ActivityStatusEnum;
  @Column({ nullable : true })
  points: number;
  @Column()
  member_id: number;
  @Column()
  section_code: number;
  @Column({ nullable: true })
  approved_by: number;
  @Column({
    type: 'timestamptz',
    nullable: true,
  })
  approved_at: Date;
  @Column({
    type: 'text',
    nullable: true,
  })
  approval_notes: string;
  @ManyToOne(() => MemberEntity, (member) => member.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'member_id' })
  member: MemberEntity;
  @ManyToOne(() => MemberEntity, (member) => member.id, { nullable: true })
  @JoinColumn({ name: 'approved_by' })
  approver: MemberEntity;
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;
  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;
}
