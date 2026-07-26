import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, OneToMany } from 'typeorm';
import { Role } from './role.entity';
import { Institution } from './institution.entity';
import { Profile } from './profile.entity';
import { AttendanceLog } from './attendance-log.entity';
import { LeaveRequest } from './leave-request.entity';
import { TeacherTraining } from './teacher-training.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column({ unique: true }) email: string;

  @Column() passwordHash: string;

  @Column({ default: 'active' }) status: 'active' | 'suspended';

  @ManyToOne(() => Role, (r) => r.users, { eager: true }) role: Role;
  @Column() roleId: string;

  @ManyToOne(() => Institution, (i) => i.users, { nullable: true }) institution: Institution;
  @Column({ nullable: true }) institutionId: string;

  @OneToOne(() => Profile, (p) => p.user) profile: Profile;

  @Column({ nullable: true }) refreshTokenHash: string; // for refresh-token rotation

  @OneToMany(() => AttendanceLog, (a) => a.user) attendanceLogs: AttendanceLog[];
  @OneToMany(() => LeaveRequest, (l) => l.user) leaveRequests: LeaveRequest[];
  @OneToMany(() => TeacherTraining, (t) => t.user) trainings: TeacherTraining[];
}
