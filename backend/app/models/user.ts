import { DateTime } from 'luxon'
import { BaseModel, column, hasMany } from '@adonisjs/lucid/orm'
import type { HasMany } from '@adonisjs/lucid/types/relations'
import Attendance from '#models/attendance'

export default class User extends BaseModel {
  @column({ isPrimary: true })
  declare id: number

  @column()
  declare fullName: string

  @column()
  declare email: string

  @column({ serializeAs: null })
  declare password: string

  @column()
  declare role: 'ADMIN' | 'DIRECTION_MEMBER' | 'PROF' | 'STUDENT'

  @column()
  declare avatarUrl: string

  // --- Student Specific Fields ---
  @column()
  declare studentUuid: string | null

  @column()
  declare paymentStatus: 'PAID' | 'LATE' | 'PENDING'

  @column()
  declare major: string | null

  @column()
  declare level: string | null

  @column.dateTime({ autoCreate: true })
  declare createdAt: DateTime

  @column.dateTime({ autoCreate: true, autoUpdate: true })
  declare updatedAt: DateTime

  @hasMany(() => Attendance, { foreignKey: 'studentId' })
  declare attendances: HasMany<typeof Attendance>
}