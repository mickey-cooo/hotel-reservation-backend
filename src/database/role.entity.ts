import { Column, DeleteDateColumn, Entity, OneToMany } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { UserEntity } from './user.entity';

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

  @OneToMany(() => UserEntity, (user) => user.role)
  users?: UserEntity[];
}
