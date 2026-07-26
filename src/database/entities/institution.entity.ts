import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from './user.entity';
import { Notice } from './notice.entity';
import { InfrastructureRequest } from './infrastructure-request.entity';
import { Asset } from './asset.entity';
import { Complaint } from './complaint.entity';
import { Inspection } from './inspection.entity';
import { StudentStatistic } from './student-statistic.entity';

@Entity()
export class Institution {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() name: string;

  @Column({ unique: true }) eiin: string;

  @Column() type: string;

  @Column('decimal', { precision: 10, scale: 7 }) latitude: number;

  @Column('decimal', { precision: 10, scale: 7 }) longitude: number;

  @OneToMany(() => User, (u) => u.institution) users: User[];
  @OneToMany(() => Notice, (n) => n.institution) notices: Notice[];
  @OneToMany(() => InfrastructureRequest, (r) => r.institution) infraRequests: InfrastructureRequest[];
  @OneToMany(() => Asset, (a) => a.institution) assets: Asset[];
  @OneToMany(() => Complaint, (c) => c.institution) complaints: Complaint[];
  @OneToMany(() => Inspection, (i) => i.institution) inspections: Inspection[];
  @OneToMany(() => StudentStatistic, (s) => s.institution) studentStats: StudentStatistic[];
}
