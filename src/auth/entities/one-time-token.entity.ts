import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
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
