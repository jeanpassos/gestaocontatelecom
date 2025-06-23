import { Entity, Column, PrimaryGeneratedColumn, OneToMany, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Segment } from '../../segments/entities/segment.entity';
// Provider não é mais diretamente relacionado aqui, será via Contract
// import { Provider } from '../../providers/entities/provider.entity'; 
import { Contract } from '../../contracts/entities/contract.entity'; // Import Contract

@Entity('company') // Especificar nome da tabela se necessário, ex: 'companies'
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cnpj: string;

  @Column({ name: 'corporate_name' })
  corporateName: string;

  // phoneLines foi movido para Contract
  // Restaurando phoneLines para manter compatibilidade com frontend
  @Column({ type: 'json', name: 'phone_lines', nullable: true })
  phoneLines: string[] | null;

  @Column({ type: 'json', nullable: true })
  assets: Record<string, any> | null; // Permitir null

  // Restaurando telephonyProviderId para persistir operadora
  @Column({ type: 'varchar', length: 36, nullable: true, name: 'telephony_provider_id' })
  telephonyProviderId: string | null;

  // telephonyProvider foi removido, a relação agora é via Contract
  // @ManyToOne(() => Provider, { nullable: true, eager: false }) // provider de telefonia
  // @JoinColumn({ name: 'telephony_provider_id' })
  // telephonyProvider: Provider | null;

  // O provider de internet continua sendo uma string dentro de assets.internet.provider

  @Column({ type: 'varchar', length: 50, nullable: true, name: 'type' })
  type: string | null; // 'headquarters' ou 'branch'

  // Restaurando contractDate para compatibilidade com frontend
  @Column({ type: 'date', nullable: true, name: 'contract_date' })
  contractDate: string | null;

  // Restaurando renewalDate para compatibilidade com frontend
  @Column({ type: 'date', nullable: true, name: 'renewal_date' })
  renewalDate: string | null;

  // Restaurando observation para persistência
  @Column({ type: 'text', nullable: true, name: 'observation' })
  observation: string | null;
  
  // address e manager podem ser JSONB ou colunas separadas.
  // Para simplificar, vou assumir que são JSONB por enquanto, como 'assets'.
  // Se forem colunas separadas, a entidade e migração precisariam de mais detalhes.
  @Column({ type: 'json', nullable: true, name: 'address' })
  address: Record<string, any> | null;

  @Column({ type: 'json', nullable: true, name: 'manager' })
  manager: Record<string, any> | null;

  // assignedUsers é uma relação ou um array de IDs?
  // Se for uma relação ManyToMany com User, precisa de setup diferente.
  // Se for array de IDs, pode ser jsonb. O DTO tem string[].
  // Por ora, não vou adicionar na entidade até ter mais clareza.

  @OneToMany(() => User, user => user.company)
  users: User[];

  @ManyToOne(() => Segment, segment => segment.companies, { eager: true, nullable: true })
  @JoinColumn({ name: 'segment_id' })
  segment: Segment | null;

  @OneToMany(() => Contract, contract => contract.company)
  contracts: Contract[];

  @CreateDateColumn({ name: 'created_at', type: 'timestamp' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp' })
  updatedAt: Date;
}
