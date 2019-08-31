module.exports = {
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME
    },
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/development`,
    },
  },
  test: {
    client: 'pg',
    connection: process.env.POSTGRESQLCONNSTR_TEST_DB,
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/test`,
    },
  },
  qa: {
    client: 'pg',
    connection: process.env.POSTGRESQLCONNSTR_DB,
    migrations: {
      directory: `${__dirname}/db/migrations`,
    },
    seeds: {
      directory: `${__dirname}/db/seeds/test`,
    },
  },
};
