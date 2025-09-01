import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, Index } from "typeorm";

@Entity()
@Index(['userId'])
export class OneTimeToken {
  @PrimaryGeneratedColumn('uuid')
  token: string;
  @Column()
  userId: number;
  @Column({ default: false })
  used: boolean;
  @Column()
  expiresAt: Date;
  @CreateDateColumn()
  createdAt: Date;
}
