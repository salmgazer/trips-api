const knex = require('../../db/knex');

const healthcheck = require('healthcheck-middleware');

module.exports = healthcheck({
  addChecks: async (fail, pass) => {
    try {
      await knex.connection.raw('SELECT 1=1;');
      pass();
    } catch (e) {
      logger.error(e);
      fail(e);
    }
  },
});
