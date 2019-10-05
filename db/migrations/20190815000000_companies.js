exports.up = async (knex) => {
  await knex.schema.createTable('companies', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('logo');
    table.boolean('deleted').notNullable().defaultTo(false);
    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.raw('now()'));
    table
      .timestamp('updatedAt')
      .notNullable()
      .defaultTo(knex.raw('now()'));
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('companies');
};
