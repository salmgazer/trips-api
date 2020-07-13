import BaseModel from './BaseModel';
import Town from "./Town";

export default class Station extends BaseModel {
  static get tableName() {
    return 'stations';
  }

	static get primaryKeyName() {
		return 'id';
	}

  static get fieldNames() {
    return [
      'id',
      'name',
      'townId',
      'stationGps',
      'createdAt',
      'updatedAt',
    ];
  }

  static get hasOne() {
    return [Town];
  }

  static get softDelete() {
    return true;
  }
}

