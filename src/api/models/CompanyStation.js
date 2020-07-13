import BaseModel from './BaseModel';

export default class CompanyStation extends BaseModel {
    static get tableName() {
        return 'companies_stations';
    }

    static get primaryKeyName() {
        return 'companyId';
    }

    get identifierParams() {
        return {companyId: this.companyId, stationId: this.stationId};
    }

    static get fieldsToGroup() {
        return ['stationId', 'companyId'];
    }

    static get fieldNames() {
        return ['companyId', 'stationId', 'createdAt', 'deleted', 'updatedAt'];
    }

    static get softDelete() {
        return true;
    }
}

