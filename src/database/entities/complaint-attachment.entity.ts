import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Complaint } from './complaint.entity';

@Entity()
export class ComplaintAttachment {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Complaint, (c) => c.attachments) complaint: Complaint;
  @Column() complaintId: string;

  @Column() fileUrl: string;
}
