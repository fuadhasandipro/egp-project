import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Institution } from './institution.entity';

@Entity()
export class InfrastructureRequest {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Institution, (i) => i.infraRequests) institution: Institution;
  @Column() institutionId: string;

  @Column() itemType: string;

  @Column('int') quantity: number;

  @Column({ default: 'Pending' }) status: string;
}
