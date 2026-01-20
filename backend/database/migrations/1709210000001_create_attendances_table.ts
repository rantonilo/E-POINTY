import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Attendances extends BaseSchema {
  protected tableName = 'attendances'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('student_id').unsigned().references('users.id').onDelete('CASCADE')
      table.integer('course_id').unsigned().notNullable() // Assuming courses table exists
      table.integer('scanned_by_id').unsigned().references('users.id')
      table.string('status').defaultTo('PRESENT')

      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}