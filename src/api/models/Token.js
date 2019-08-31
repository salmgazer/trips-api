import BaseModel from './BaseModel';

export default class Token extends BaseModel {
  static get tableName() {
    return 'tokens';
  }

  static get fieldNames() {
    return ['clientId', 'token'];
  }

	static get primaryKeyName() {
		return 'clientId';
	}
  /*
  static get fieldNames() {
    throw new Error('Forbidden!');
  }
  */
}

