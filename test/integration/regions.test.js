/* eslint-disable no-underscore-dangle */
import {expect, fx, server, request, resources, apiPaths, removeTimestamps} from '../../testHelper';
import {
	prepareAuthentication,
	deleteAuthentication,
	initialUserDetails,
	adminSignedHeaders,
} from '../authenticationHelper';
import Region from "../../src/api/models/Region";

const { countries, regions } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL REGION TESTS *****', () => {
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

		describe('GET /admin/countries/{country_code}/regions', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
			});

			afterEach(async () => {
				await Region.deleteAll();
			});

			const [selectedCountry] = countries;
			it('Returns a list of regions', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}?offset=${offset}&limit=${limit}`;

				const expectedRegions = regions.filter(r => r.countryCode === selectedCountry.code);
				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.regions.length).to.eq(expectedRegions.length);
			});

			it('Returns regions first page', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}?offset=0&limit=1`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.regions.length).to.eq(1);
			});

			it('Returns regions second page', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}?offset=1&limit=1`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.regions.length).to.eq(1);
			});
		});

		describe('GET /v1/admin/countries/{country_code}/regions/{region_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
			});

			afterEach(async () => {
				await Region.deleteAll();
			});

			it('Returns a single json object of a region', async () => {
				const [selectedCountry] = countries;
				const selectedRegion = regions.find(r => r.countryCode === selectedCountry.code);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(selectedRegion.name);
			});
		});


		describe('POST /v1/admin/countries/{country_code}/regions/{region_id}', () => {
			beforeEach(async () => {
				await Region.deleteAll();
			});

			afterEach(async () => {
				await Region.deleteAll();
			});

			it('Creates a single Region', async () => {
				const [selectedCountry] = countries;
				const selectedRegion = regions.find(r => r.countryCode === selectedCountry.code);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}`;

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(selectedRegion)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedRegion);
			});
		});

		describe('PUT /v1/admin/countries/{country_code}/regions/{region_id}', () => {
			beforeEach(async () => {
				await Region._bulkInsert(regions);
			});

			afterEach(async () => {
				await Region.deleteAll();
			});

			it('Updates a single Region', async () => {
				const [selectedCountry] = countries;
				const selectedRegion = regions.find(r => r.countryCode === selectedCountry.code);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}`;
				const updatedRegion = selectedRegion;
				const newRegionName = 'Updated Region';
				updatedRegion.name = newRegionName;

				const response = await request(app)
					.put(requestPath)
					.set(authorization)
					.send(updatedRegion)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(newRegionName);
			});
		});

		describe('DELETE /v1/admin/countries/{country_code}/regions/{region_id}', () => {

			const [selectedCountry] = countries;
			const selectedRegion = regions.find(r => r.countryCode === selectedCountry.code);
			const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${countries[1].code}/${resources.regions}/${selectedRegion.id}`;

			before(async () => {
				await Region._bulkInsert(regions);
			});

			after(async () => {
				await Region.deleteAll();
			});

			it('Deletes a single Region', async () => {
				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body).to.eq(1);
			});

			it('Fails to delete an unexisting Region', async () => {
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

