import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ length: 255 })
  name: string;

  @Column({ length: 255, unique: true })
  @Index()
  email: string;

  @Column({ length: 20, unique: true })
  @Index()
  phoneNumber: string;

  @Column({ length: 255 })
  @Exclude()
  password: string;

  /** Comma-separated or JSON array of active JWT tokens (optional refresh tracking) */
  @Column({ type: 'text', nullable: true })
  @Exclude()
  tokens: string | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
