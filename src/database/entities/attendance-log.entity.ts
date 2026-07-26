import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class AttendanceLog {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (u) => u.attendanceLogs) user: User;
  @Column() userId: string;

  @Column('date') date: string;

  @Column({ type: 'enum', enum: ['Present', 'Late', 'Absent'] }) status: string;

  @Column('decimal', { precision: 10, scale: 7 }) lat: number;
  @Column('decimal', { precision: 10, scale: 7 }) lng: number;
}
