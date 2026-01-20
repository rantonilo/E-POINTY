import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Payments extends BaseSchema {
  protected tableName = 'payments'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('student_id').unsigned().references('users.id').onDelete('CASCADE')
      table.string('title').notNullable()
      table.decimal('amount', 10, 2).notNullable()
      table.enum('status', ['PAID', 'LATE', 'PENDING']).defaultTo('PENDING')
      table.timestamp('due_date').notNullable()
      
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}