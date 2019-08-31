/* eslint no-underscore-dangle: 0 */
import moment from 'moment';
import jwt from 'jsonwebtoken';
import Country from '../src/api/models/Country';
import Token from '../src/api/models/Token';
import Client from '../src/api/models/Client';
import { fx } from '../testHelper';

const SHA256 = require('crypto-js/sha256');

const jwtSecret = 'QKBKWEHjkbwfbewkj885767JVJBJBWdsvewjeh2232dftytrrw';

const { tokens, clients, countries } = fx;

async function prepareAuthentication() {
  await Client._bulkInsert(clients);
  await Token._bulkInsert(tokens);
  await Country._bulkInsert(countries);
}

async function deleteAuthentication() {
  await Country.deleteAll();
  await Token.deleteAll();
  await Client.deleteAll();
}


const initialUserDetails = {
  email: 'tester@rovebus.com',
  iat: moment().unix(),
  exp: moment()
    .add(1, 'days')
    .unix(),
  name: 'Rovebus Tester',
  'https://rovebus.com/authorization': {
    groups: [],
    permissions: [],
    roles: [],
  },
};

function signedHeaders(requestPath) {
  const timestamp = moment().unix();
  const [client] = clients;
  const { token } = tokens.find(t => t.clientId === client.id);

  const hash = SHA256(`${requestPath}${timestamp}${token}`).toString();
  return {
    'x-rovebus-timestamp': timestamp,
    'x-rovebus-hash': hash,
    'x-rovebus-client': client.id,
  };
}

function adminSignedHeaders(userDetails) {
  return {
    Authorization: `Bearer ${jwt.sign(userDetails, jwtSecret)}`,
  };
}

module.exports = {
  signedHeaders,
  initialUserDetails,
  adminSignedHeaders,
  prepareAuthentication,
  deleteAuthentication,
};
