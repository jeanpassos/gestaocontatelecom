import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Company {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  cnpj: string;

  @Column()
  corporateName: string;

  @Column('jsonb')
  phoneLines: string[];

  @Column('jsonb')
  assets: Record<string, any>;

  @OneToMany(() => User, user => user.company)
  users: User[];
}
