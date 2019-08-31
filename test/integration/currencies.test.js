/* eslint-disable no-underscore-dangle */
import {expect, fx, request, resources, apiPaths, removeTimestamps, server} from '../../testHelper';
import {
	prepareAuthentication,
	deleteAuthentication,
	initialUserDetails,
	adminSignedHeaders,
} from '../authenticationHelper';

import Currency from "../../src/api/models/Currency";


const { currencies } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL CURRENCY TESTS *****', () => {
	before(async () => {
		app = await server;
		await prepareAuthentication();
	});


	after(async () => {
		await deleteAuthentication();
	});

	describe('*** Admin Tests ***', () => {
		let authorization;

		before(async () => {
			const userDetails = Object.assign({}, initialUserDetails);
			authorization = adminSignedHeaders(userDetails);
		});

		describe('GET /admin/currencies', () => {
			beforeEach(async () => {
				await Currency._bulkInsert(currencies);
			});

			afterEach(async () => {
				await Currency.deleteAll();
			});

			it('Returns a list of currencies', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.currencies}?offset=${offset}&limit=${limit}`;
				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.currencies.length).to.eq(currencies.length);
			});

		});

		describe('GET /v1/admin/currencies/{currency_id}', () => {
			const [selectedCurrency] = currencies;

			beforeEach(async () => {
				await Currency._bulkInsert(currencies);
			});

			afterEach(async () => {
				await Currency.deleteAll();
			});

			it('Returns a single json object of a currency', async () => {

				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.currencies}/${selectedCurrency.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedCurrency);
			});
		});

		describe('POST /v1/admin/currencies', () => {
			const [newCurrency] = currencies;

			beforeEach(async () => {
				await Currency.deleteAll();
			});

			afterEach(async () => {
				await Currency.deleteAll();
			});


			it('Creates a single Currency', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.currencies}`;

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(newCurrency)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				removeTimestamps(response.body);
				expect(response.body).to.eql(newCurrency);
			});
		});

		describe('PUT /v1/admin/currencies/{currency_id}', () => {

			const [selectedCurrency] = currencies;

			beforeEach(async () => {
				await Currency._bulkInsert(currencies);
			});

			afterEach(async () => {
				await Currency.deleteAll();
			});

			it('Updates a single Currency', async () => {

				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.currencies}/${selectedCurrency.id}`;
				const updatedCurrency= selectedCurrency;
				const newCurrencyName = 'New currency name';
				updatedCurrency.name = newCurrencyName;

				const response = await request(app)
					.put(requestPath)
					.set(authorization)
					.send(updatedCurrency)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(newCurrencyName);
			});
		});

		describe('DELETE /v1/admin/currencies/{currency_id}', () => {

			const [selectedCurrency] = currencies;

			before(async () => {
				await Currency._bulkInsert(currencies);
			});

			after(async () => {
				await Currency.deleteAll();
			});

			it('Deletes a single Currency', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.currencies}/${selectedCurrency.id}`;

				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body).to.eq(1);
			});

			it('Fails to delete an unexisting Currency', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.currencies}/${selectedCurrency.id}`;

				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(404);

				expect(response.body.code).to.eq(404);
				expect(response.body.error).to.eq('Object not found');
			});
		});
	});

});

