/* eslint-disable no-restricted-syntax */
require('../src/bootstrap/init');
const knex = require('./knex');

console.info('About to delete all tables (press Ctrl+C to exit)');

async function deleteAllTables() {
  const rows = await knex('pg_tables').where({ schemaname: 'public' });
  for (const row of rows) {
    console.info(`Deleting table: ${row.tablename}`);
    // eslint-disable-next-line no-await-in-loop
    await knex.schema.raw(`DROP TABLE IF EXISTS ${row.tablename} CASCADE`)
      .then(() => { console.info('deleted'); })
      .catch((err) => { console.info(err); });
  }
}

appEmitter.on('init:done', async () => {
  await deleteAllTables();
  knex.destroy();
});
