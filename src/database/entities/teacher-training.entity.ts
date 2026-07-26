import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { User } from './user.entity';
import { TrainingProgram } from './training-program.entity';

@Entity()
export class TeacherTraining {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => User, (u) => u.trainings) user: User;
  @Column() userId: string;

  @ManyToOne(() => TrainingProgram, (t) => t.records) training: TrainingProgram;
  @Column() trainingId: string;

  @Column('date') completionDate: string;
}
