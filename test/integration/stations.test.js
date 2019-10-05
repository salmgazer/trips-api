/* eslint-disable no-underscore-dangle */
import { expect, fx, server, request, resources, apiPaths, removeTimestamps } from '../../testHelper';
import {
	prepareAuthentication,
	deleteAuthentication,
	initialUserDetails,
	adminSignedHeaders,
} from '../authenticationHelper';
import Region from "../../src/api/models/Region";
import Town from '../../src/api/models/Town';
import Station from "../../src/api/models/Station";


const { countries, regions, towns, stations } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL STATION TESTS *****', () => {
	before(async () => {
		app = await server;
		await prepareAuthentication();
	});


	after(async () => {
		await deleteAuthentication();
	});

	describe('*** Admin Tests ***', () => {
		let authorization;
		const [selectedCountry] = countries;
		const selectedRegion = regions.find(r => r.countryCode === selectedCountry.code);
		const selectedTown = towns.find(t => t.regionId === selectedRegion.id);

		before(async () => {
			const userDetails = Object.assign({}, initialUserDetails);
			authorization = adminSignedHeaders(userDetails);
		});

		describe('GET /admin/countries/{country_code}/regions/towns/{town_id}/stations', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
			});

			afterEach(async () => {
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Returns a list of stations', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}?offset=${offset}&limit=${limit}`;

				const expectedStations = stations.filter(s => s.townId === selectedTown.id);

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.stations.length).to.eq(expectedStations.length);
			});

			it('Returns stations first page', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}?offset=0&limit=1`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.stations.length).to.eq(1);
			});

			it('Returns stations second page', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}?offset=1&limit=1`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.stations.length).to.eq(1);
			});
		});

		describe('GET /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}/stations/{station_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
			});

			afterEach(async () => {
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Returns a single json object of a station', async () => {

				const selectedStation = stations.find(s => s.townId === selectedTown.id);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}/${selectedStation.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(selectedStation.name);
			});
		});

		describe('POST /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}/stations/{station_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station.deleteAll();
			});

			afterEach(async () => {
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Creates a single Station', async () => {
				const selectedStation = stations.find(s => s.townId === selectedTown.id);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}`;

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(selectedStation)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedStation);
			});
		});

		describe('PUT /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}/stations/{station_id}', () => {

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
			});

			afterEach(async () => {
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Updates a single Station', async () => {
				const selectedStation = stations.find(s => s.townId === selectedTown.id);
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}/${selectedStation.id}`;

				const updatedStation = selectedStation;
				const newStationName = 'Updated Station';
				updatedStation.name = newStationName;

				const response = await request(app)
					.put(requestPath)
					.set(authorization)
					.send(updatedStation)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.name).to.eq(newStationName);
			});
		});

		describe('DELETE /v1/admin/countries/{country_code}/regions/{region_id}/towns/{town_id}/stations/{station_id}', () => {
			const selectedStation = stations.find(s => s.townId === selectedTown.id);
			const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${selectedCountry.code}/${resources.regions}/${selectedRegion.id}/${resources.towns}/${selectedTown.id}/${resources.stations}/${selectedStation.id}`;

			before(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
			});

			after(async () => {
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Deletes a single Station', async () => {
				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

        expect(response.body.deleted).to.eq(true);
			});

			it('Fails to delete an unexisting Station', async () => {
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

