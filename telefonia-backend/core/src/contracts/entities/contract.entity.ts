import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Company } from '../../companies/entities/company.entity';
import { Provider } from '../../providers/entities/provider.entity';

export enum ContractStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  CANCELED = 'canceled',
}

@Entity('contract')
export class Contract {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Company, company => company.contracts, { onDelete: 'CASCADE', nullable: false })
  @JoinColumn({ name: 'company_id' })
  company: Company;

  @ManyToOne(() => Provider, provider => provider.contracts, { onDelete: 'RESTRICT', nullable: false }) // Ou SET NULL dependendo da regra de negócio
  @JoinColumn({ name: 'provider_id' })
  provider: Provider;

  @Column({ type: 'varchar', length: 100, nullable: true, name: 'contract_number' })
  contractNumber: string | null;

  @Column('jsonb', { name: 'phone_lines', nullable: true })
  phoneLines: string[] | null;

  @Column({ type: 'date', nullable: true, name: 'contract_date' })
  contractDate: string | null;

  @Column({ type: 'date', nullable: true, name: 'renewal_date' })
  renewalDate: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true, name: 'monthly_fee' })
  monthlyFee: number | null;

  @Column({
    type: 'enum',
    enum: ContractStatus,
    default: ContractStatus.PENDING,
    name: 'status'
  })
  status: ContractStatus;

  @Column({ type: 'text', nullable: true, name: 'observation' })
  observation: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
