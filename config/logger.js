const bunyan = require('bunyan');

const level = getEnv() === 'production' ? 'info' : 'debug';

const logger = bunyan.createLogger({
  name: 'logger',
  stream: process.stdout,
  level,
});

module.exports = logger;
