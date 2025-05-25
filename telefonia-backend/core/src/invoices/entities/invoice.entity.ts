import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { User } from '../../users/entities/user.entity';

export enum InvoiceStatus {
  PENDING = 'pending',
  PAID = 'paid',
  OVERDUE = 'overdue',
  CANCELED = 'canceled'
}

export enum TelcoProvider {
  VIVO = 'vivo',
  CLARO = 'claro',
  TIM = 'tim',
  OI = 'oi',
  OTHER = 'other'
}

@Entity()
export class Invoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  invoiceNumber: string;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: number;

  @Column({ type: 'date' })
  dueDate: Date;

  @Column({ type: 'date', nullable: true })
  paymentDate: Date;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING
  })
  status: InvoiceStatus;

  @Column({
    type: 'enum',
    enum: TelcoProvider
  })
  provider: TelcoProvider;

  @Column({ nullable: true })
  pdfUrl: string;

  @Column('jsonb', { nullable: true })
  invoiceDetails: Record<string, any>;

  @ManyToOne(() => Company)
  company: Company;

  @ManyToOne(() => User)
  uploadedBy: User;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
