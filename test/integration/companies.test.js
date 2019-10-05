/* eslint-disable no-underscore-dangle */
import {expect, fx, request, resources, apiPaths, removeTimestamps, server} from '../../testHelper';
import {
	prepareAuthentication,
	deleteAuthentication,
	initialUserDetails,
	adminSignedHeaders,
} from '../authenticationHelper';

import Company from "../../src/api/models/Company";


const { companies } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL COMPANY TESTS *****', () => {
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

		describe('GET /admin/companies', () => {
			beforeEach(async () => {
				await Company._bulkInsert(companies);
			});

			afterEach(async () => {
				await Company.deleteAll();
			});

			it('Returns a list of companies', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.companies}?offset=${offset}&limit=${limit}`;
				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.companies.length).to.eq(companies.length);
			});

		});

		describe('GET /v1/admin/companies/{company_id}', () => {
			const [selectedCompany] = companies;

			beforeEach(async () => {
				await Company._bulkInsert(companies);
			});

			afterEach(async () => {
				await Company.deleteAll();
			});

			it('Returns a single json object of a company', async () => {

				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.companies}/${selectedCompany.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedCompany);
			});
		});

		describe('POST /v1/admin/companies', () => {
			const [newCompany] = companies;

			beforeEach(async () => {
				await Company.deleteAll();
			});

			afterEach(async () => {
				await Company.deleteAll();
			});


			it('Creates a single Company', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.companies}`;

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(newCompany)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				removeTimestamps(response.body);
				expect(response.body).to.eql(newCompany);
			});
		});

		describe('PUT /v1/admin/companies/{company_id}', () => {

			const [selectedCompany] = companies;

			beforeEach(async () => {
				await Company._bulkInsert(companies);
			});

			afterEach(async () => {
				await Company.deleteAll();
			});

			it('Updates a single Company', async () => {

				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.companies}/${selectedCompany.id}`;
				const updatedCompany = selectedCompany;
				const newCompanyName = 'New company name';
				updatedCompany.name = newCompanyName;

				const response = await request(app)
					.put(requestPath)
					.set(authorization)
					.send(updatedCompany)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(newCompanyName);
			});
		});

		describe('DELETE /v1/admin/companies/{company_id}', () => {

			const [selectedCompany] = companies;

			before(async () => {
				await Company._bulkInsert(companies);
			});

			after(async () => {
				await Company.deleteAll();
			});

			it('Deletes a single Company', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.companies}/${selectedCompany.id}`;

				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

        expect(response.body.deleted).to.eq(true);
			});

			it('Fails to delete an unexisting Company', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.companies}/${selectedCompany.id}`;

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

