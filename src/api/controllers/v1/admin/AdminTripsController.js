import BaseController from '../../BaseController';

class AdminTripsController extends BaseController {
  tableName() {
    return 'trips';
  }

  _identifierValue(swagger) {
    return swagger.params.trip_id.value;
  }

	_extraFilterParams(req) {
		const params = {};

		if (req.swagger.params.from_town_id && req.swagger.params.from_town_id.value) {
		  params.fromTownId = req.swagger.params.from_town_id.value;
    }

		if (req.swagger.params.to_town_id && req.swagger.params.to_town_id.value) {
			params.toTownId = req.swagger.params.to_town_id.value;
		}

		return params;
	}

	static get defaultSortField() {
		return 'leavesAt';
	}

	static get defaultOrder() {
		return 'ASC';
	}

	_specialFilterParams(req) {
    const result = [];
		if (req.swagger.params.leaves_at && req.swagger.params.leaves_at.value) {
			result.push({ column: 'leavesAt', operator: '>=', value: req.swagger.params.leaves_at.value });
		}
		return result;
  }
}

const controller = new AdminTripsController();

module.exports = {
  show: controller.show.bind(controller),
  index: controller.index.bind(controller),
  update: controller.update.bind(controller),
  destroy: controller.destroy.bind(controller),
	create: controller.create.bind(controller),
	AdminTripsController
};
