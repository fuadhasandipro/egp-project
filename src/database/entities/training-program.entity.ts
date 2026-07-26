import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { TeacherTraining } from './teacher-training.entity';

@Entity()
export class TrainingProgram {
  @PrimaryGeneratedColumn('uuid') id: string;

  @Column() title: string;

  @Column() duration: string;

  @Column() organizer: string;

  @OneToMany(() => TeacherTraining, (t) => t.training) records: TeacherTraining[];
}
