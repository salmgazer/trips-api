
exports.up = async (knex) => {
  await knex.schema.createTable('countries', (table) => {
    table.string('code');
    table.string('name').notNullable();
    table
      .timestamp('createdAt')
      .notNullable()
      .defaultTo(knex.raw('now()'));
    table
      .timestamp('updatedAt')
      .notNullable()
      .defaultTo(knex.raw('now()'));
    table.primary('code');
  });
};

exports.down = async (knex) => {
  await knex.schema.dropTable('countries');
};
