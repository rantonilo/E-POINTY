import { BaseSchema } from '@adonisjs/lucid/schema'

export default class Courses extends BaseSchema {
  protected tableName = 'courses'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('code').notNullable()
      table.integer('professor_id').unsigned().references('users.id')
      table.string('schedule').notNullable()
      table.timestamp('created_at')
      table.timestamp('updated_at')
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}