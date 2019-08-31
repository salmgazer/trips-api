import Client from './api/models/Client';
import Token from './api/models/Token';

const SHA256 = require('crypto-js/sha256');
const moment = require('moment');

class ClientAuthentication {
  /**
   * @param {function} next      - calls the next middleware in the express middleware chain
   */
  async authenticateByToken() {
    const storedToken = await this.getClientToken();

    if (!storedToken.token) {
      return false;
    }

    const expectedToken = await SHA256(`${this.requestPath}${this.requestTime}${storedToken.token}`).toString();
    return this.hash === expectedToken;
  }

  /**
   * Returns json object of the client making the request
   * @TODO: First check if token is in cache after cache implementation
   */
  getClientToken() {
    // return knex('tokens').where({ clientName }).select('token').first();
    return Token.findOne({ clientId: this.clientId });
  }

  /**
   * Validates the unix timestamp in header
   * @param {string} rovebysimestamp
   * @return {boolean}  - true if timestamp is valid unix format (only unix time format allowed)
   */
  validateTime() {
    return moment.unix(this.requestTime).isValid();
  }

  /**
   *  Authenticates an API by the token sent
   * @param {object} req         - request object
   * @return {function} next     - calls the next middleware in the express middleware chain
   * @TODO: fix promise issue when wrong unix timestamp is sent
   */
  async authenticate(req, next) {
    // if (getEnv() === 'development') {
    //   return next();
    // }
    this.clientId = req.headers['x-rovebus-client'];
    this.requestTime = req.headers['x-rovebus-timestamp'];
    this.hash = req.headers['x-rovebus-hash'];
    this.requestPath = req.originalUrl.replace('%7C', '|');

    if (!this.validateTime()) {
      return next(new Error('x-rovebus-timestamp must be in unix format. Access denied!'));
    }

    const authResult = await this.authenticateByToken();

    if (authResult) {
      req.client = await Client.findOne({ id: this.clientId });
      return next();
    }
    return next(new Error('Wrong Api Key. Access denied!'));
  }
}

module.exports = {
  auth: new ClientAuthentication(),
};
