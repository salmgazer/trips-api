exports.up = async (knex) => {
  await knex.schema.createTable('bookings', (table) => {
    table.increments('id');
    table.string('userEmail');
    table.string('phone').notNullable();
    table.integer('tripId').notNullable();
    table.foreign('tripId').references('trips.id');
    table.integer('numberOfSeats').notNullable().defaultTo(1);
    table.string('status').notNullable().defaultTo('unpaid');
    table.jsonb('unusedTicketCodes');
    table.jsonb('usedTicketCodes');
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
  await knex.schema.dropTable('bookings');
};
