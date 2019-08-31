/* eslint-disable no-underscore-dangle */
import {expect, fx, request, resources, apiPaths, removeTimestamps, server} from '../../testHelper';
import {
	signedHeaders,
	prepareAuthentication,
	deleteAuthentication,
	initialUserDetails,
	adminSignedHeaders,
} from '../authenticationHelper';
import Region from "../../src/api/models/Region";
import Town from "../../src/api/models/Town";
import Station from "../../src/api/models/Station";
import Trip from "../../src/api/models/Trip";
import Company from "../../src/api/models/Company";


const { trips, towns, stations, regions, companies } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL TRIP TESTS *****', () => {
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

		describe('GET /admin/trips', () => {
			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip._bulkInsert(trips);
			});

			afterEach(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Returns a list of trips', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=${limit}`;
				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(trips.length);
			});

			it('Returns a list of trips from town id 1 to town id 6', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=${limit}&to_town_id=6&from_town_id=1`;
				const expectedTrips = trips.filter(t => t.fromTownId === 1 && t.toTownId === 6);

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(expectedTrips.length);
			});

			it('Returns a list of trips from town id 1 to town id 6', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(1);
			});

			it('Returns a list of trips from town id 6 to town id 1', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=${limit}&to_town_id=1&from_town_id=6`;
				const expectedTrips = trips.filter(t => t.fromTownId === 6 && t.toTownId === 1);

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(expectedTrips.length);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at 2019-08-17T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-08-17T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(1);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at or after 2019-08-16T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-08-16T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(1);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at or after 2019-08-18T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-08-18T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(0);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at or before 2019-09-17T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-09-17T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(0);
			});

		});

		describe('GET /v1/admin/trips/{trip_id}', () => {
			const [selectedTrip] = trips;

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip._bulkInsert(trips);
			});

			afterEach(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
				selectedTrip.price = 120;
			});

			it('Returns a single json object of a trip', async () => {

				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}/${selectedTrip.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				delete response.body.price;
				delete selectedTrip.price;
				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedTrip);
			});
		});

		describe('POST /v1/admin/trips', () => {
			const [newTrip] = trips;

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip.deleteAll();
			});

			afterEach(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
				newTrip.price = 120;
			});


			it('Creates a single Trip', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}`;

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(newTrip)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				delete response.body.price;
				delete newTrip.price;
				removeTimestamps(response.body);
				expect(response.body).to.eql(newTrip);
			});
		});

		describe('PUT /v1/admin/trips/{trip_id}', () => {

			const [selectedTrip] = trips;

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip._bulkInsert(trips);
			});

			afterEach(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
				selectedTrip.price = 120;
			});

			it('Updates a single Trip', async () => {

				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}/${selectedTrip.id}`;
				const updatedTrip= selectedTrip;
				const newTripStatus = 'full';
				updatedTrip.status = newTripStatus;

				const response = await request(app)
					.put(requestPath)
					.set(authorization)
					.send(updatedTrip)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.status).to.eq(newTripStatus);
			});
		});

		describe('DELETE /v1/admin/trips/{trip_id}', () => {

			const [selectedTrip] = trips;

			before(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip._bulkInsert(trips);
			});

			after(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Deletes a single Trip', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}/${selectedTrip.id}`;

				const response = await request(app)
					.delete(requestPath)
					.set(authorization)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body).to.eq(1);
			});

			it('Fails to delete an unexisting Trip', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.trips}/${selectedTrip.id}`;

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
		describe('GET /client/trips', () => {
			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip._bulkInsert(trips);
			});

			afterEach(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
			});

			it('Returns a list of trips', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=${limit}`;
				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(trips.length);
			});

			it('Returns a list of trips from town id 1 to town id 6', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=${limit}&to_town_id=6&from_town_id=1`;
				const expectedTrips = trips.filter(t => t.fromTownId === 1 && t.toTownId === 6);

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(expectedTrips.length);
			});

			it('Returns a list of trips from town id 1 to town id 6', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(1);
			});

			it('Returns a list of trips from town id 6 to town id 1', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=${limit}&to_town_id=1&from_town_id=6`;
				const expectedTrips = trips.filter(t => t.fromTownId === 6 && t.toTownId === 1);

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(expectedTrips.length);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at 2019-08-17T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-08-17T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(1);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at or after 2019-08-16T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-08-16T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(1);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at or after 2019-08-18T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-08-18T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(0);
			});

			it('Returns a list of trips from town id 1 to town id 6 which leaves at or before 2019-09-17T15:07:27.443Z', async () => {
				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}?offset=${offset}&limit=1&to_town_id=6&from_town_id=1&leaves_at=2019-09-17T15:07:27.443Z`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				expect(response.body.trips.length).to.eq(0);
			});

		});

		describe('GET /v1/client/trips/{trip_id}', () => {
			const [selectedTrip] = trips;

			beforeEach(async () => {
				await Region._bulkInsert(regions);
				await Town._bulkInsert(towns);
				await Station._bulkInsert(stations);
				await Company._bulkInsert(companies);
				await Trip._bulkInsert(trips);
			});

			afterEach(async () => {
				await Trip.deleteAll();
				await Company.deleteAll();
				await Station.deleteAll();
				await Town.deleteAll();
				await Region.deleteAll();
				selectedTrip.price = 120;
			});

			it('Returns a single json object of a trip', async () => {

				const requestPath = `${apiPaths.v1.clientBasePath}/${resources.trips}/${selectedTrip.id}`;

				const response = await request(app)
					.get(requestPath)
					.set(signedHeaders(requestPath))
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(200);

				delete response.body.price;
				delete selectedTrip.price;
				removeTimestamps(response.body);
				expect(response.body).to.eql(selectedTrip);
			});
		});
	});
});

