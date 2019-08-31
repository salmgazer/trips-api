const fs = require('fs');
const async = require('async');
const _ = require('underscore');
const EventEmitter = require('events');

const auth0Config = require('../../config/auth0');



class AppEmitter extends EventEmitter {}
const appEmitter = new AppEmitter();

global.getEnv = () => {
  if (process.env.NODE_ENV) {
    return process.env.NODE_ENV;
  }

  return 'development';
};

const logger = require('../../config/logger');

global.logger = logger;

global.appEmitter = appEmitter;

console.info(`Current environment: ${getEnv()}`);

async.series(
  [

    /* Initialize config */
    (callback) => {
      const commonConfig = JSON.parse(fs.readFileSync('./config/common.api.json', 'utf8'));
      let envConfig = {};
      const envConfigPath = `./config/${getEnv()}.api.json`;

      try {
        fs.accessSync(envConfigPath, fs.F_OK);
        envConfig = JSON.parse(fs.readFileSync(envConfigPath, 'utf8'));
      } catch (e) {
        console.error(e);
      }

      envConfig = _.extend(commonConfig, envConfig);
      envConfig.rootPath = `${__dirname}/..`;
      envConfig.auth0 = auth0Config;

      // eslint-disable-next-line no-underscore-dangle
      global._config = envConfig;
      console.info('Initialize config: Done');

      // we wait 1ms so this is not called to early
      return process.nextTick(callback);
    },
  ],

  /* Async callback, runs after everything is done */
  (err) => {
    if (err) return console.error(`Initialize Errors: ${err}`);

    /* No inialize errors */
    console.info('calling init:done');
    appEmitter.emit('init:done');
    return null;
  },
);
