import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Institution } from './institution.entity';

@Entity()
export class StudentStatistic {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Institution, (i) => i.studentStats) institution: Institution;
  @Column() institutionId: string;

  @Column() academicYear: string;

  @Column('int') totalBoys: number;

  @Column('int') totalGirls: number;
}
