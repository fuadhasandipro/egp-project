import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Institution } from './institution.entity';

@Entity()
export class Asset {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Institution, (i) => i.assets) institution: Institution;
  @Column() institutionId: string;

  @Column() name: string;

  @Column({ type: 'enum', enum: ['Good', 'Needs Repair'] }) condition: string;
}
