import BaseController from '../../BaseController';
import SimpleRelationService from "../../../services/SimpleRelationService";
import CompanyStation from "../../../models/CompanyStation";
import Station from "../../../models/Station";

class AdminCompaniesController extends BaseController {
	tableName() {
		return 'companies';
	}

	_identifierValue(swagger) {
		return swagger.params.company_id.value;
	}


	async stations(req, res, next) {
		let response;
		let extraOptions = {};
		const model = Station;

		try {
			const offset = req.swagger.params.offset.value;
			const limit = req.swagger.params.limit.value;
			extraOptions = this._attachSpecialParams(extraOptions, req);

			const extraParams = this._extraFilterParams(req);
			const relationsParams = new SimpleRelationService().getSimpleRelations(model, req, {});

			extraOptions.params = Object.assign(extraParams, relationsParams);
			// extraOptions.functionQuery = this._multiIdParams(req);
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

			const companyStations = await CompanyStation.fetchAll({ companyId: req.swagger.params.company_id.value });

			extraOptions.functionQuery = (builder) => {
				builder.whereIn('stations.id', companyStations.map(cs => cs.stationId));
				return builder;
			};

			const result = await Station.filterAndCount(0, 1000, extraOptions);

			response = await this._buildIndexResponse(req, offset, limit, result, 'stations');
			this._updateResponseHeaders(req, res);
			this._respondByContentType(req.headers['content-type'], res, response);
		} catch (err) {
			logger.error(err);
			res.status(400).json(this._errorMessage(`There is an error with ${model.name}`, 400, err));
		}

		return next();
	}

	async createStation(req, res, next) {
		let station;

		try {
			const stationBody = req.body;
			station = await Station.create(stationBody);
			if (station) {
				await CompanyStation.create({
					companyId: req.swagger.params.company_id.value,
					stationId: station.id
				});
			}
			res.status(201).json(station);
		} catch (err) {
			logger.error(err);
			res
				.status(404)
				.json(this._errorMessage(`Could not create station ${station.name}`, 404, err));
		}
		return next();
	}
}

const controller = new AdminCompaniesController();

module.exports = {
	show: controller.show.bind(controller),
	index: controller.index.bind(controller),
	update: controller.update.bind(controller),
	destroy: controller.destroy.bind(controller),
	create: controller.create.bind(controller),
	createStation: controller.createStation.bind(controller),
	stations: controller.stations.bind(controller)
};
