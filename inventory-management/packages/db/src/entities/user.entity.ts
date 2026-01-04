import { Entity, PrimaryColumn, Column } from 'typeorm'

@Entity({ name: 'users' })
export class User {
  @PrimaryColumn({ type: 'uuid', default: () => 'uuid_generate_v4()' })
  id!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @Column()
  firstName!: string;

  @Column()
  lastName!: string;
}
