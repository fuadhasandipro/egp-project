import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn('uuid') id: string;

  @OneToOne(() => User, (u) => u.profile)
  @JoinColumn()
  user: User;

  @Column() userId: string;

  @Column() fullName: string;

  @Column() phone: string;

  @Column() designation: string;

  @Column() nid: string;
}
