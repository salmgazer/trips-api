import {AdminTripsController} from '../admin/AdminTripsController';

class ClientTripsController extends AdminTripsController {}

const controller = new ClientTripsController();

module.exports = {
  index: controller.index.bind(controller),
  show: controller.show.bind(controller),
};
