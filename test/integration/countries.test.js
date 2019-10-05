/* eslint-disable no-underscore-dangle */
import {expect, fx, server, request, resources, apiPaths, removeTimestamps} from '../../testHelper';
import {
  prepareAuthentication,
  deleteAuthentication,
  initialUserDetails,
  adminSignedHeaders,
} from '../authenticationHelper';

const { countries } = fx;

let app;
const offset = 0;
const limit = 20;


describe('***** ALL COUNTRY TESTS *****', () => {
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

    describe('GET /admin/countries', () => {
      it('Returns a list of countries', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/?offset=${offset}&limit=${limit}`;
        const response = await request(app)
          .get(requestPath)
          .set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.countries.length).to.eq(countries.length);
      });

      it('Returns countries first page', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/?offset=0&limit=1`;

        const response = await request(app)
          .get(requestPath)
					.set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.countries.length).to.eq(1);
      });

      it('Returns countries second page to admin client', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/?offset=1&limit=1`;

        const response = await request(app)
          .get(requestPath)
					.set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.countries.length).to.eq(1);
      });
    });

    describe('GET /v1/admin/countries/{country_code}', () => {

      it('Returns a single json object of a country to admin client', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${countries[0].code}`;

        const response = await request(app)
          .get(requestPath)
					.set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.name).to.eq(countries[0].name);
      });
    });

		describe('POST /v1/admin/countries/{country_code}', () => {

			it('Creates a single Country', async () => {
				const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}`;
				const newCountry = { code: "SC", name: "Somce country", deleted: false };

				const response = await request(app)
					.post(requestPath)
					.set(authorization)
					.send(newCountry)
					.set('Accept', 'application/json')
					.expect('Content-Type', /json/)
					.expect(201);

				removeTimestamps(response.body);
				expect(response.body).to.eql(newCountry);
			});
		});

    describe('PUT /v1/admin/countries/{country_code}', () => {
      before(async () => {
        app = await server;
      });

      it('Updates a single Country', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${countries[1].code}`;
        const updatedCountry = countries[1];
        const newCountryName = 'Updated Country';
        updatedCountry.name = newCountryName;

        const response = await request(app)
          .put(requestPath)
					.set(authorization)
          .send(updatedCountry)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.name).to.eq(newCountryName);
      });
    });

    describe('DELETE /v1/admin/countries/{country_code}', () => {

      it('Deletes a single Country', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${countries[1].code}`;

        const response = await request(app)
          .delete(requestPath)
					.set(authorization)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200);

        expect(response.body.deleted).to.eq(true);
      });

      it('Fails to delete an unexisting Country', async () => {
        const requestPath = `${apiPaths.v1.adminBasePath}/${resources.countries}/${countries[1].code}`;

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

