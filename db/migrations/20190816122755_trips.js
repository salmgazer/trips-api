exports.up = async (knex) => {
  await knex.schema.createTable('trips', (table) => {
    table.increments('id');
    table.integer('fromStationId').notNullable();
    table.foreign('fromStationId').references('stations.id');
    table.integer('toStationId').notNullable();
    table.foreign('toStationId').references('stations.id');
    table.integer('fromTownId').notNullable();
    table.foreign('fromTownId').references('towns.id');
    table.integer('toTownId').notNullable();
    table.foreign('toTownId').references('towns.id');
    table.timestamp('leavesAt').notNullable();
    table.timestamp('arrivesAt').notNullable();
    table.decimal('price').notNullable();
    table.string('status').notNullable();
    table.integer('companyId').notNullable();
    table.foreign('companyId').references('companies.id');
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
  await knex.schema.dropTable('trips');
};
