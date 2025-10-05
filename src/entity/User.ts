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

  @Column({ nullable: true })
  name!: string

  @Column({ default: false })
  isOnboarded!: boolean

  @Column({ nullable: true })
  role!: string

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
