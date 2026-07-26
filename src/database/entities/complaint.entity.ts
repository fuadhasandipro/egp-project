import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Institution } from './institution.entity';
import { ComplaintAttachment } from './complaint-attachment.entity';

@Entity()
export class Complaint {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Institution, (i) => i.complaints) institution: Institution;
  @Column() institutionId: string;

  @Column('text') description: string;

  @Column() severity: string;

  @Column({ default: 'Open' }) status: string;

  @OneToMany(() => ComplaintAttachment, (a) => a.complaint) attachments: ComplaintAttachment[];
}
