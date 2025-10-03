import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm'

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id?: number

  @Column({ unique: true })
  email!: string

  @Column({ nullable: true })
  name!: string

  @Column({ default: 'user' })
  role!: string

  @Column({ default: false })
  isOnboarded!: boolean

  @CreateDateColumn()
  createdAt?: Date

  @UpdateDateColumn()
  updatedAt?: Date
}
