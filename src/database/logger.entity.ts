import { Column, Entity, Index } from 'typeorm';
import { TemplateEntity } from './template.entity';
import { LogLevel } from '../enum/common.status';

class Payload {
  message: string;
  stack: string;
}

@Entity('app-logs')
@Index('idx_application_logs_created_at', ['createdAt'])
@Index('idx_application_logs_level', ['level'])
@Index('idx_application_logs_service', ['service'])
export class LoggerEntity extends TemplateEntity {
  @Column({
    type: 'enum',
    enum: LogLevel,
  })
  level: LogLevel;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  service: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  event: string;

  @Column({
    type: 'varchar',
    nullable: true,
  })
  endpoint: string;

  @Column({
    type: 'integer',
    nullable: true,
  })
  statusCode: number;

  @Column({
    type: 'jsonb',
  })
  payload: Payload;
}
