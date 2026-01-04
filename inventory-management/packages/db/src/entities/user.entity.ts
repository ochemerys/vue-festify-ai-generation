import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  id!: string;

  @Column('varchar', { unique: true })
  email!: string;

  @Column('varchar')
  password!: string;

  @Column('varchar')
  firstName!: string;

  @Column('varchar')
  lastName!: string;

  @Column('varchar')
  role!: string;

  @Column('boolean', { default: true })
  isActive!: boolean;
}
