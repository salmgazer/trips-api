import BaseController from '../../BaseController';

class AdminCountriesController extends BaseController {
  tableName() {
    return 'countries';
  }

  _identifierValue(swagger) {
    return swagger.params.country_code.value;
  }
}

const controller = new AdminCountriesController();

module.exports = {
  show: controller.show.bind(controller),
  index: controller.index.bind(controller),
  update: controller.update.bind(controller),
  destroy: controller.destroy.bind(controller),
	create: controller.create.bind(controller),
};
