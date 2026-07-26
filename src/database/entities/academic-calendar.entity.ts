import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity()
export class AcademicCalendar {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column('date') date: string;

  @Column() eventName: string;

  @Column({ default: false }) isHoliday: boolean;
}
