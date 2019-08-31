/* eslint-disable import/no-extraneous-dependencies */
const server = require('./src/server');
const request = require('supertest');
const { expect, assert } = require('chai');
const fx = require('node-fixtures');
const knex = require('./db/knex');
const sinon = require('sinon');

async function addRelation(tableName, params) {
  return knex(`${tableName}`).insert(params);
}

async function removeRelation(tableName) {
  return knex(`${tableName}`).del();
}


function removeTimestamps(params) {
	delete params.updatedAt;
	delete params.createdAt;
}

const resources = {
  countries: 'countries',
  regions: 'regions',
  towns: 'towns',
  stations: 'stations',
  companies: 'companies',
  trips: 'trips',
  currencies: 'currencies'
};

const apiPaths = {
  v1: {
    clientBasePath: '/v1/client',
    adminBasePath: '/v1/admin',
  },
};

module.exports = {
  request,
  expect,
  assert,
  fx,
  server,
  addRelation,
  removeRelation,
  sinon,
  apiPaths,
  resources,
  removeTimestamps
};
