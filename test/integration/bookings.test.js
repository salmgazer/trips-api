/* eslint-disable no-underscore-dangle */
import {expect, fx, request, resources, apiPaths, server} from '../../testHelper';
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
import Booking from '../../src/api/models/Booking';


const { trips, towns, stations, regions, companies, bookings } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL BOOKINGS TESTS *****', () => {
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
      userDetails.name = "Some Admin";
      userDetails.email = "adminUser@gmail.com";
      authorization = adminSignedHeaders(userDetails);
    });

    describe('GET /admin/bookings', () => {
      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Returns a list of bookings to admin user', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.bookings}?offset=${offset}&limit=${limit}`;
        const response = await request(app)
          .get(requestPath)
          .set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.bookings.length).to.eq(bookings.length);
      });
    });

    describe('GET /v1/admin/bookings/{booking_id}', () => {
      const [selectedBooking] = bookings;

      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Returns a single json object of a booking', async () => {

        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.bookings}/${selectedBooking.id}`;

        const response = await request(app)
          .get(requestPath)
          .set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.id).to.eq(selectedBooking.id);
        expect(response.body.numberOfSeats).to.eq(selectedBooking.numberOfSeats);
        expect(response.body.status).to.eq(selectedBooking.status);
        expect(response.body.userEmail).to.eq(selectedBooking.userEmail);
        expect(response.body.tripId).to.eq(selectedBooking.tripId);
      });
    });

    describe('POST /v1/admin/bookings', () => {
      const [newBooking] = bookings;

      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking.deleteAll();
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });


      it('Creates a single Booking', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.bookings}`;

        const response = await request(app)
          .post(requestPath)
          .set(authorization)
          .send(newBooking)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body.id).to.eq(newBooking.id);
        expect(response.body.numberOfSeats).to.eq(newBooking.numberOfSeats);
        expect(response.body.status).to.eq(newBooking.status);
        expect(response.body.userEmail).to.eq(newBooking.userEmail);
        expect(response.body.tripId).to.eq(newBooking.tripId);
      });
    });

    describe('PUT /v1/admin/bookings/{booking_id}', () => {

      const [selectedBooking] = bookings;

      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Updates a single Booking', async () => {

        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.bookings}/${selectedBooking.id}`;
        const updatedBooking = selectedBooking;
        const newBookingStatus = 'paid';
        updatedBooking.status = newBookingStatus;

        const response = await request(app)
          .put(requestPath)
          .set(authorization)
          .send(updatedBooking)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.status).to.eq(newBookingStatus);
      });
    });

    describe('DELETE /v1/admin/bookings/{booking_id}', () => {

      const [selectedBooking] = bookings;

      before(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      after(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Deletes a single Booking', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.bookings}/${selectedBooking.id}`;

        const response = await request(app)
          .delete(requestPath)
          .set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.deleted).to.eq(true);
        expect(response.body.id).to.eq(selectedBooking.id);
        expect(response.body.numberOfSeats).to.eq(selectedBooking.numberOfSeats);
        expect(response.body.status).to.eq(selectedBooking.status);
        expect(response.body.userEmail).to.eq(selectedBooking.userEmail);
        expect(response.body.tripId).to.eq(selectedBooking.tripId);
      });

      it('Fails to delete an unexisting Booking', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.bookings}/${selectedBooking.id}`;

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
    let authorization;

    before(async () => {
      const userDetails = Object.assign({}, initialUserDetails);
      userDetails.name = "Some User";
      userDetails.email = "user2@gmail.com";
      authorization = adminSignedHeaders(userDetails);
    });

    describe('POST /v1/client/bookings', () => {
      const [newBooking] = bookings;

      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking.deleteAll();
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });


      it('Creates a single Booking', async () => {
        const requestPath = `${apiPaths.v1.clientBasePath}/${resources.bookings}`;

        const response = await request(app)
          .post(requestPath)
          .set(signedHeaders(requestPath))
          .send(newBooking)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(201);

        expect(response.body.id).to.eq(newBooking.id);
        expect(response.body.numberOfSeats).to.eq(newBooking.numberOfSeats);
        expect(response.body.status).to.eq(newBooking.status);
        expect(response.body.userEmail).to.eq(newBooking.userEmail);
        expect(response.body.tripId).to.eq(newBooking.tripId);
      });
    });

    describe('GET /client/bookings', () => {
      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Returns a list of bookings', async () => {
        const requestPath = `${apiPaths.v1.clientBasePath}/${resources.bookings}?offset=${offset}&limit=${limit}&leaves_at=2019-08-17T07:07:27.443Z`;
        const response = await request(app)
          .get(requestPath)
          .set(signedHeaders(requestPath))
          .set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.bookings.length).to.eq(1);
      });
    });

    describe('GET /v1/client/bookings/{booking_id}', () => {
      const [selectedBooking] = bookings;

      beforeEach(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      afterEach(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Returns a single json object of a booking', async () => {

        const requestPath = `${apiPaths.v1.clientBasePath}/${resources.bookings}/${selectedBooking.id}`;

        const response = await request(app)
          .get(requestPath)
          .set(signedHeaders(requestPath))
          .set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.id).to.eq(selectedBooking.id);
        expect(response.body.numberOfSeats).to.eq(selectedBooking.numberOfSeats);
        expect(response.body.status).to.eq(selectedBooking.status);
        expect(response.body.tripId).to.eq(selectedBooking.tripId);
        expect(response.body.userEmail).to.eq(selectedBooking.userEmail);
      });
    });

    describe('DELETE /v1/client/bookings/{booking_id}', () => {

      const selectedBooking = bookings[1];

      before(async () => {
        await Region._bulkInsert(regions);
        await Town._bulkInsert(towns);
        await Station._bulkInsert(stations);
        await Company._bulkInsert(companies);
        await Trip._bulkInsert(trips);
        await Booking._bulkInsert(bookings);
      });

      after(async () => {
        await Booking.deleteAll();
        await Trip.deleteAll();
        await Company.deleteAll();
        await Station.deleteAll();
        await Town.deleteAll();
        await Region.deleteAll();
      });

      it('Deletes a single Booking', async () => {
        const requestPath = `${apiPaths.v1.clientBasePath}/${resources.bookings}/${selectedBooking.id}`;

        const response = await request(app)
          .delete(requestPath)
          .set(authorization)
          .set(signedHeaders(requestPath))
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.deleted).to.eq(true);
        expect(response.body.id).to.eq(selectedBooking.id);
        expect(response.body.numberOfSeats).to.eq(selectedBooking.numberOfSeats);
        expect(response.body.status).to.eq(selectedBooking.status);
        expect(response.body.userEmail).to.eq(selectedBooking.userEmail);
        expect(response.body.tripId).to.eq(selectedBooking.tripId);
      });

      it('Fails to delete an unexisting Booking', async () => {
        const requestPath = `${apiPaths.v1.clientBasePath}/${resources.bookings}/${selectedBooking.id}`;

        const response = await request(app)
          .delete(requestPath)
          .set(authorization)
          .set(signedHeaders(requestPath))
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404);

        expect(response.body.code).to.eq(404);
        expect(response.body.error).to.eq('Object not found');
      });
    });
  });
});

