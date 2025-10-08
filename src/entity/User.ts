import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryColumn()
  id!: string

  @Column({ unique: true })
  email!: string

  @Column()
  name!: string

  @Column({ default: false })
  isOnboarded!: boolean

  @Column({ nullable: false })
  role!: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
