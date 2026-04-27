import {
  Column,
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export class TemplateEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', nullable: true })
  createdBy: string;

  @CreateDateColumn({
    type: 'timestamptz',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt: Date;

  @Column({ type: 'varchar', nullable: true })
  updatedBy: string;

  @UpdateDateColumn({
    type: 'timestamptz',
    nullable: true,
    default: () => 'CURRENT_TIMESTAMP',
  })
  updatedAt: Date;
}
