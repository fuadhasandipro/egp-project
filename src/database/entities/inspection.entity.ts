import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Institution } from './institution.entity';
import { User } from './user.entity';

@Entity()
export class Inspection {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Institution, (i) => i.inspections) institution: Institution;
  @Column() institutionId: string;

  @ManyToOne(() => User) inspector: User;
  @Column() inspectorId: string;

  @Column('int') score: number;

  @Column('text', { nullable: true }) notes: string;
}
