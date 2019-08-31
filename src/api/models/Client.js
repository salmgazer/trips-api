import BaseModel from './BaseModel';

export default class Client extends BaseModel {
  static get tableName() {
    return 'clients';
  }

	static get primaryKeyName() {
		return 'id';
	}

  static get fieldNames() {
    return ['id', 'name', 'description'];
  }
}

