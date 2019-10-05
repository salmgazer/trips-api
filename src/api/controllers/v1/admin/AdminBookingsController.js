import BaseController from '../../BaseController';

class AdminBookingsController extends BaseController {

  // add station id here if user is user is from station
  // know if user is super admin
  // _extraFilterParams(req) {
  //    return { userEmail: req.user.email };
  // }

  _identifierValue(swagger) {
    return swagger.params.booking_id.value;
  }
}

const controller = new AdminBookingsController();

module.exports = {
  index: controller.index.bind(controller),
  show: controller.show.bind(controller),
  create: controller.create.bind(controller),
  update: controller.update.bind(controller),
  destroy: controller.destroy.bind(controller)
};
