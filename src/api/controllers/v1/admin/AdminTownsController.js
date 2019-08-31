import BaseController from '../../BaseController';

class AdminTownsController extends BaseController {
  tableName() {
    return 'towns';
  }

  _identifierValue(swagger) {
    return swagger.params.town_id.value;
  }

	_extraFilterParams(req) {
		const params = {
      regionId: req.swagger.params.region_id.value,
		};

		return params;
	}
}

const controller = new AdminTownsController();

module.exports = {
  show: controller.show.bind(controller),
  index: controller.index.bind(controller),
  update: controller.update.bind(controller),
  destroy: controller.destroy.bind(controller),
	create: controller.create.bind(controller),
	AdminTownsController
};
