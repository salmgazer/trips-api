import moment from 'moment';
import csvStringify from 'csv-stringify';
import camelize from 'camelize';
import Trip from '../models/Trip';
import SimpleRelationService from '../services/SimpleRelationService';
import UrlBuilder from '../helpers/UrlBuilder';
import Country from '../models/Country';
import Region from '../models/Region';
import Town from '../models/Town';
import Station from '../models/Station';
import Token from '../models/Token';
import Client from '../models/Client';
import Currency from '../models/Currency';
import Company from '../models/Company';
import Booking from '../models/Booking';
import UserHelper from '../helpers/UserHelper';

export default class BaseController {
  static get models() {
    return {
      countries: Country,
      regions: Region,
      towns: Town,
      stations: Station,
      trips: Trip,
      tokens: Token,
      clients: Client,
			currencies: Currency,
			companies: Company,
			bookings: Booking,
    };
  }

	async index(req, res, next) {
		let response;
		let extraOptions = {};
		const model = this.model();

		try {
			const offset = req.swagger.params.offset.value;
			const limit = req.swagger.params.limit.value;
			extraOptions = this._attachSpecialParams(extraOptions, req);

			const extraParams = this._extraFilterParams(req);
			const relationsParams = new SimpleRelationService().getSimpleRelations(model, req, {});

			extraOptions.params = Object.assign(extraParams, relationsParams);
			extraOptions.functionQuery = this._multiIdParams(req);
			if (req.clientApp) {
				extraOptions.client = req.clientApp;
			}
			if (req.country) {
				extraOptions.country = req.country;
			}

			if (req.swagger.params.sort && req.swagger.params.sort.value) {
				extraOptions.sort = req.swagger.params.sort.value;
			}

			if (req.swagger.params.search && req.swagger.params.search.value) {
				extraOptions.search = req.swagger.params.search.value;
			}

			extraOptions.specialParams = this._specialFilterParams(req);

			const result = await model.filterAndCount(offset, limit, extraOptions);

			response = await this._buildIndexResponse(req, offset, limit, result);
			this._updateResponseHeaders(req, res);
			this._respondByContentType(req.headers['content-type'], res, response);
		} catch (err) {
			logger.error(err);
			res.status(400).json(this._errorMessage(`There is an error with ${model.name}`, 400, err));
		}

		return next();
	}

	/**
	 * Adds key-value pairs for an endpoint
	 * @param {object} req
	 * @param {object} res
	 */
	_updateResponseHeaders(req, res) {
		if (!res.headersSent) {
			const ttl = req.swagger.operation.pathObject.definition['x-ttl'] || _config.defaultTTL;
			const expires = moment().add(ttl, 'seconds');
			res.set('Cache-Control', `private, max-age=${ttl}`);
			res.set('Expires', expires);
		}
	}

	_specialFilterParams(req) {
		return [];
	}

	/**
	 * Returns response format based on content-type
	 * @param req
	 * @param res
	 * @param response  - response object from _buildIndexResponse
	 * @private
	 */
	_respondByContentType(contentType, res, response, entity = camelize(this.tableName())) {
		switch (contentType) {
			case 'text/csv': {
				res.attachment(`${this.tableName()}-${Date.now()}.csv`);
				csvStringify(JSON.parse(JSON.stringify(response[entity])), {header: true}).pipe(res);
				return;
			}
			default: {
				res.status(200).json(response);
			}
		}
	}

	_extraFilterParams() {
		return {};
	}

	_attachSpecialParams(params) {
		return params;
	}

	_multiIdParams(req) {
		const idParam =
			req.swagger.params[this.model().primaryKeyName] &&
			req.swagger.params[this.model().primaryKeyName].value;
		if (idParam && idParam.length > 0) {
			return (builder) => builder.whereIn(this.model().primaryKeyName, idParam);
		}
		return {};
	}

  async create(req, res, next) {
    const model = this.model();

    try {
      const resource = this._bodyParams(req);
      const result = await model.create(resource);
      res.status(201).json(result);
    } catch (err) {
      logger.error(err);
      res
        .status(404)
        .json(this._errorMessage(`Could not create an object of type ${model.name}`, 404, err));
    }
    return next();
  }

  async optionalLogin(req, res, next) {
		if (!req.headers.authorization) {
			return;
		}
    try {
      UserHelper.attachUserToRequest(req, res, next, _config.auth0.namespace);
    } catch (err) {
      console.error('error on attachUserToRequest');
      console.error(err);
    }
	}


	_bodyParams(req) {
		return req.swagger.params[this.model().name].value;
	}

	async update(req, res, next) {
		const model = this.model();

		try {
			const resource = this._bodyParams(req);
			const result = await model.update(resource, this._identifierValue(req.swagger));
			this._updateResponseHeaders(req, res);
			res.status(200).json(result);
		} catch (err) {
			logger.error(err);
			res
				.status(404)
				.json(this._errorMessage(`Could not update an object of type ${model.name}`, 404, err));
		}
		return next();
	}

  async destroy(req, res, next) {
    const tableName = this.tableName();
    const identifierValue = this._identifierValue(req.swagger);
    let params = this._identifierParams(identifierValue);

    this._addDestroyEtraOptions(req, params);

    console.log(params);

    try {
      params = new SimpleRelationService().getSimpleRelations(this.model(), req, params);
      const result = await this.model().delete(params);
      if (result) {
        res.status(200).json(result);
      } else {
        res.status(404).json(this._errorMessage(`Could not find an object of type ${tableName} with id ${identifierValue}`, 404, 'Object not found'));
      }
    } catch (err) {
      console.error(err);
      res.status(404).json(this._errorMessage(`Could not delete an object of type ${tableName}`, 404, err));
    }
    return next();
  }

  _addDestroyEtraOptions() {}

	async _buildShowResponse(req, resource) {
		return resource;
	}

	async show(req, res, next) {
		const model = this.model();

		try {
			const identifierValue = this._identifierValue(req.swagger);
			let params = this._identifierParams(identifierValue);
			params = new SimpleRelationService().getSimpleRelations(model, req, params);

			const extraOptions = {};
			extraOptions.client = req.clientApp;
			extraOptions.country = req.country;

			const resource = await model.findOne(params, extraOptions);

			if (resource) {
				this._updateResponseHeaders(req, res);
				const response = await this._buildShowResponse(req, resource);
				res.status(200).send(response);
			} else {
				res
					.status(404)
					.json(
						this._errorMessage(
							`No ${model.name} with id/uuid ${identifierValue} was found.`,
							404,
							'Entity does not exist',
						),
					);
			}
		} catch (err) {
			logger.error(err);
			res.status(404).json(this._errorMessage(`There is an error with ${model.name}`, 404, err));
		}

		return next();
	}


  tableName() {
    return this.constructor.name.replace(/Admin|Client|Controller/gi, '').toLowerCase();
  }

  model() {
    return this.constructor.models[this.tableName()];
  }

  _identifierValue(swagger) {
    return swagger.params.id.value;
  }

  _identifierParams(identifierValue) {
    const params = {};
    params[this.model().primaryKeyName] = identifierValue;
    return params;
  }


	/**
   * Generates a response object for an index request
   * @param {object} req
   * @param {integer} offset
   * @param {integer} limit
   * @param {json} result
   * @return {object} response
   */
  _buildIndexResponse(req, offset, limit, result, className = this.tableName()) {
    const { items } = result;

    let nextLink;
    if (result.count > (offset + items.length)) {
      const newParams = Object.assign({}, req.query);
      newParams.offset = offset + limit;
      nextLink = UrlBuilder.urlFor(req.path, '', newParams);
    }

    let prevLink;
    if (offset > 0 && result.count > 0) {
      const newParams = Object.assign({}, req.query);
      newParams.offset = offset - limit;
      prevLink = UrlBuilder.urlFor(req.path, '', newParams);
    }

    const response = {
      totalCount: result.count,
      count: items.length,
      offset,
      limit,
      links: {
        next: nextLink,
        prev: prevLink,
      },
    };
    response[className] = items;
    return response;
  }

  _addToIndexExtraOptions(req, extraOptions = {}) {
    return extraOptions;
  }

  /**
   * Returns error message object as defined in swagger
   * @param {string} message
   * @param {integer} code
   * @param {object} error
   */
  _errorMessage(message, code, error) {
    return {
      message,
      code,
      error,
    };
  }
}
