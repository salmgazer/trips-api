const knex = require('knex');
const config = require('../knexfile.js')[getEnv()];

async function initializeConnection() {
  if (!module.exports.connection) {
    const connection = await knex(config);
    module.exports.connection = connection;
  }
}

module.exports = {
  initializeConnection,
  connection: null,
};
