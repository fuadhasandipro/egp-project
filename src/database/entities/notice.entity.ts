import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn } from 'typeorm';
import { Institution } from './institution.entity';

@Entity()
export class Notice {
  @PrimaryGeneratedColumn('uuid') id: string;

  @ManyToOne(() => Institution, (i) => i.notices) institution: Institution;
  @Column() institutionId: string;

  @Column() title: string;

  @Column('text') content: string;

  @CreateDateColumn() createdAt: Date;
}
