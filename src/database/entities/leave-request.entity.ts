import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';

@Entity()
export class LeaveRequest {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (u) => u.leaveRequests) user: User;
  @Column() userId: string;

  @Column() reason: string;

  @Column('date') startDate: string;
  @Column('date') endDate: string;

  @Column({ default: 'Pending' }) status: 'Pending' | 'Approved' | 'Rejected';
}
