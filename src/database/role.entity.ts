import { Column, DeleteDateColumn, Entity } from 'typeorm';
import { TemplateEntity } from './template.entity';

@Entity('role')
export class RoleEntity extends TemplateEntity {
  @Column({ type: 'varchar', nullable: true })
  name: string;

  @Column({ type: 'jsonb', nullable: true })
  description: string;

  @Column({ type: 'integer', nullable: true })
  priority: number;

  @DeleteDateColumn({ type: 'timestamptz', nullable: true })
  deletedAt: Date;
}
