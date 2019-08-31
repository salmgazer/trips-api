/* eslint-disable no-underscore-dangle */
import {expect, fx, server, request, resources, apiPaths, removeTimestamps} from '../../testHelper';
import {
	signedHeaders,
	prepareAuthentication,
	deleteAuthentication,
	initialUserDetails,
	adminSignedHeaders,
} from '../authenticationHelper';
import Region from "../../src/api/models/Region";
import Town from '../../src/api/models/Town';


const { countries, regions, towns } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL TOWN TESTS *****', () => {
	const [selectedCountry] = countries;
	const selectedRegion = regions.find(r => r.countryCode === selectedCountry.code);
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

		describe('POST /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town.deleteAll();
			});

			afterEach(async () => {
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Creates a single Town', async () => {
				const selectedTown = towns.find(t => t.regionId === selectedRegion.id);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}`;

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(selectedTown)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedTown);
			});
		});

		describe('PUT /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
			});

			afterEach(async () => {
				await Town.deleteAll();
				await Region.deleteAll();
			});


			it('Updates a single Town', async () => {
				const selectedTown = towns.find(t => t.regionId === selectedRegion.id);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}`;

				const updatedTown = selectedTown;
				const newTownName = 'Updated Town';
				updatedTown.name = newTownName;

				const response = await request(app)
					.put(requestPath)
					.set(authorization)
					.send(updatedTown)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(newTownName);
			});
		});

		describe('DELETE /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}', () => {
			const selectedTown = towns.find(t => t.regionId === selectedRegion.id);
			const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}`;

			before(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
			});

			after(async () => {
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Deletes a single Town', async () => {
				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body).to.eq(1);
			});

			it('Fails to delete an unexisting Town', async () => {
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

	describe('*** Client Tests ***', () => {
		describe('GET /admin/countries/{country_code}/regions/towns/{town_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
			});

			afterEach(async () => {
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Returns a list of towns', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}?offset=${offset}&limit=${limit}`;

				const expectedTowns = towns.filter(t => t.regionId === selectedRegion.id);
				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.towns.length).to.eq(expectedTowns.length);
			});

			it('Returns towns first page', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}?offset=0&limit=1`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.towns.length).to.eq(1);
			});

			it('Returns towns second page', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}?offset=1&limit=1`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.towns.length).to.eq(1);
			});
		});

		describe('GET /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
			});

			afterEach(async () => {
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Returns a single json object of a town', async () => {

				const selectedTown = towns.find(t => t.regionId === selectedRegion.id);
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(selectedTown.name);
			});
		});
	});
});

