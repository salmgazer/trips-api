import {AdminTownsController} from '../admin/AdminTownsController';

class ClientTownsController extends AdminTownsController {}

const controller = new ClientTownsController();

module.exports = {
	index: controller.index.bind(controller),
	show: controller.show.bind(controller),
};
