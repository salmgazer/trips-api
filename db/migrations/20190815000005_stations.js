
exports.up = async (knex) => {
  await knex.schema.createTable('stations', (table) => {
    table.increments('id');
    table.string('name').notNullable();
    table.string('stationGps');
    table.integer('townId');
    table.foreign('townId').references('towns.id');
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
  await knex.schema.dropTable('stations');
};
