import BaseModel from './BaseModel';

export default class Country extends BaseModel {
  static get tableName() {
    return 'countries';
  }

  static get primaryKeyName() {
    return 'code';
  }

  static get fieldNames() {
    return ['code', 'name'];
  }
}

