import { Entity, Column, PrimaryGeneratedColumn, Index, CreateDateColumn, UpdateDateColumn } from 'typeorm';

export enum ProviderType {
  TELEPHONY = 'telephony', // Para operadoras de telefonia (móvel/fixa)
  INTERNET = 'internet',   // Para provedores de internet
  GENERAL = 'general',     // Para casos onde a distinção não é necessária ou é mista
}

@Entity('provider')
export class Provider {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: false })
  name: string; // Nome de exibição, ex: "Vivo Fibra"

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 50, nullable: false })
  value: string; // Valor único para referência, ex: "vivo_fibra"

  @Column({
    type: 'enum',
    enum: ProviderType,
    default: ProviderType.GENERAL,
  })
  type: ProviderType;

  @CreateDateColumn({ name: 'created_at', type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamp with time zone' })
  updatedAt: Date;
}
