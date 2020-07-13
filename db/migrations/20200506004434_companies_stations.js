
exports.up = async (knex) => {
    await knex.schema.createTable('companies_stations', (table) => {
        table.integer('companyId').notNullable();
        table.integer('stationId').notNullable();
        table.foreign('companyId').references('companies.id');
        table.foreign('stationId').references('stations.id');
        table.boolean('deleted').notNullable().defaultTo(false);
        table.primary(['companyId', 'stationId']);
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
    await knex.schema.dropTable('companies_stations');
};
