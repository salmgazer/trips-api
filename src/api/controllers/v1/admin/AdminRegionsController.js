import BaseController from '../../BaseController';

class AdminRegionsController extends BaseController {
  tableName() {
    return 'regions';
  }

  _identifierValue(swagger) {
    return swagger.params.region_id.value;
  }

	_extraFilterParams(req) {
		const params = {
			countryCode: req.swagger.params.country_code.value,
		};

		return params;
	}

    _bodyParams(req) {
        const region = req.swagger.params[this.model().name].value;
        region.countryCode = req.swagger.params.country_code.value;
        return region;
    }
}

const controller = new AdminRegionsController();

module.exports = {
  show: controller.show.bind(controller),
  index: controller.index.bind(controller),
  update: controller.update.bind(controller),
  destroy: controller.destroy.bind(controller),
	create: controller.create.bind(controller),
};
