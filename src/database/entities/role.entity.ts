import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Role {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) name: 'admin' | 'to' | 'ato' | 'head_teacher' | 'teacher';

  @OneToMany(() => User, (u) => u.role) users: User[];
}
