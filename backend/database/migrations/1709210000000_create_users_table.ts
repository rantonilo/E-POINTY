import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Users extends BaseSchema {
  protected tableName = 'users'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('full_name').notNullable()
      table.string('email').notNullable().unique()
      table.string('password').notNullable()
      table.enum('role', ['ADMIN', 'DIRECTION_MEMBER', 'PROF', 'STUDENT']).defaultTo('STUDENT')
      table.string('avatar_url').nullable()
      
      // Student specific
      table.uuid('student_uuid').nullable().unique().index()
      table.enum('payment_status', ['PAID', 'LATE', 'PENDING']).defaultTo('PENDING')
      table.string('major').nullable()
      table.string('level').nullable()

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}