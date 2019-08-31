
exports.up = async (knex) => {
  await knex.schema.createTable('currencies', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('symbol');
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
  await knex.schema.dropTable('currencies');
};
