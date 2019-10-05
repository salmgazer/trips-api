import BaseController from '../../BaseController';
import SimpleRelationService from '../../../services/SimpleRelationService';

class ClientBookingsController extends BaseController {

  _addToIndexExtraOptions(req, extraOptions = {}) {
    extraOptions.client = req.clientApp;
  }

  _extraFilterParams(req) {
    return { userEmail: req.user.email };
  }

  _identifierValue(swagger) {
    return swagger.params.booking_id.value;
  }

  async create(req, res, next) {
    await this.optionalLogin(req, res, next);

    const tableName = this.tableName();
    const extraOptions = {};
    let params = {};

    try {
      params = new SimpleRelationService().getSimpleRelations(this.model(), req, params);
      const result = await this.model().create(req.body, params, extraOptions);
      res.status(201).json(result);
    } catch (err) {
      console.error(err);
      res.status(404).json(this._errorMessage(`Could not create an object of type ${tableName}`, 404, err));
    }
    return next();
  }


  _addDestroyEtraOptions(req, params={}) {
    params.userEmail = req.user.email;
  }
}

const controller = new ClientBookingsController();

module.exports = {
  index: controller.index.bind(controller),
  show: controller.show.bind(controller),
  create: controller.create.bind(controller),
  update: controller.update.bind(controller),
  destroy: controller.destroy.bind(controller)
};
