/* eslint-disable no-underscore-dangle, global-require */
import pluralize from 'pluralize';
import capitalize from 'capitalize';
import camelize from 'camelize';

export default class BaseModel {
  constructor(rowItem) {
    Object.assign(this, rowItem);
  }

  /**
   * Returns name of table associated with a model
   */
  static get tableName() {
    throw new Error('All children must define tableName');
  }

  static get requestNamespace() {
    return require('cls-hooked').getNamespace('request');
  }

  static get fieldNames() {
    throw new Error('All children must define fieldNames');
  }

  static get fieldNamesWithTableName() {
    return this.fieldNames.map(name => `${this.tableName}.${name}`);
  }

  static get rawFieldNamesWithTableName() {
    return this.fieldNamesWithTableName.map(fieldName => `"${fieldName.split('.').join('"."')}"`);
  }

  static get table() {
    return this.connection(this.tableName);
  }

  /**
   * Fetches a single row from a table of a model
   * @param {object} conditions
   * @return {object}
   */
  static async findOne(conditions, extraOptions = {}) {
    const {client} = extraOptions;
    const query = this.table.where(conditions);
    this._addSoftDeletionConditionIfNeeded(query);

    if (client) {
      this._addClientConditions(query);
    }

    const row = await query.first();
    if (row) {
      return this.initializeModel(row);
    }
    return null;
  }

  static _addClientConditions(query) {
    return query;
  }

  /**
   * Returns the total number of rows of table in a model's table
   * @param {object} conditions
   * @return {integer}
   */
  static async count(conditions = {}) {
    const query = this.table.where(conditions);
    this._addSoftDeletionConditionIfNeeded(query);
    const result = await query.count();
    return parseInt(result[0].count, 10);
  }

  /**
  * Returns rows from model's table
  * @param {json} params
  * @param {integer} offset
  * @param {integer} limit
  * @return {json}
  */
  static async filter(offset, limit, options) {
    const { search, sort, params,client, functionQuery } = options;

    const query = this.table.select(this.fieldNamesWithTableName);

    if (params) {
      query.where(params);
    }

    if (client) {
      this._addClientConditions(query);
    }

    this._addSoftDeletionConditionIfNeeded(query);
    if (functionQuery) {
      query.where(functionQuery);
    }


    if (search) {
      this._addSearchQuery(query, search);
    }

    this.addColumnRelations(query);

    query.groupBy(`${this.tableName}.${this.primaryKeyName}`);

    query.orderByRaw(this.sortField(sort));

    query.limit(limit).offset(offset);

    return query.map(row => this.initializeModel(row));
  }

  static get softDelete() {
    return false;
  }

  static _addSoftDeletionConditionIfNeeded(query) {
    if (this.softDelete) {
      query.andWhere({ deleted: false });
    }
  }

  /**
     * Returns rows from model's table and the full count of rows that match the criteria
     * @param {object} conditions
     * @param {integer} offset
     * @param {integer} limit
     * @return {object}
     */
  static async filterAndCount(offset, limit, options) {
    const {
      params, primaryKeyIds, functionQuery, search, sort, specialParams
    } = options;
    const query = this.table;

    if (params) {
      query.where(params);
    }

    this._addSoftDeletionConditionIfNeeded(query);
    if (functionQuery) {
      query.where(functionQuery);
    }

    if (search) {
      this._addSearchQuery(query, search);
    }

    this._addSpecialConditions(query, specialParams);

    query.select(this.fieldNamesWithTableName);

    if (primaryKeyIds && primaryKeyIds.length > 0) {
      query.whereIn(this.primaryKeyName, primaryKeyIds);
    }

    query.orderByRaw(this.sortField(sort));

    query.limit(limit).offset(offset);

    return this._runQueryWithCount(query);
  }

	static _addSpecialConditions(query, conditions) {
    conditions.forEach((condition) => {
      query.where(condition.column, condition.operator, condition.value)
    });
	}

  static async _runQueryWithCount(query) {
    // this column counts using window functions
    query.select(this.connection.raw('count(*) OVER() AS full_count'));
    let count = 0;
    const items = await query.reduce(async (memo, row) => {
      const aRow = row;
      // all rows have same the full_count value
      count = aRow.full_count;
      // remove the column
      delete aRow.full_count;
      // push a new instance of the model
      memo.push(await this.initializeModel(row));
      return memo;
    }, []);
    return { items, count: parseInt(count, 10) };
  }

	static _addSearchQuery(query, search) {
		query.andWhere(builder =>
			this.textSearchFields.forEach(prop =>
				builder.orWhere(`${this.tableName}.${prop}`, 'ILIKE', `%${search}%`)));
	}

  static get textSearchFields() {
    return [];
  }

  static async initializeModel(row) {
    return new this(row);
  }

  static get defaultSortField() {
    return this.primaryKeyName;
  }

  static get defaultOrder() {
    return 'DESC';
  }

  static get primaryKeyName() {
    return 'updatedAt';
  }

  static get defaultSort() {
    return this._prependTableForSort(this.defaultSortField, this.defaultOrder);
  }

  static _prependTableForSort(field, order) {
    return `"${this.tableName}"."${field}" ${order}`;
  }

  static sortField(sort) {
    if (!sort) {
      return this.defaultSort;
    }

    let sortField = sort;
    let orderField = this.defaultOrder;
    if (sort.indexOf(':') > 0) {
      [sortField, orderField] = sort.split(':');
    }
    if (this.fieldNames.indexOf(sortField) < 0) {
      return this.defaultSort;
    }
    return this._prependTableForSort(sortField, orderField);
  }

  static delete(conditions) {
    return this.connection.transaction(trx => this.deleteWithTrx(conditions, trx));
  }

  static async deleteWithTrx(conditions, trx) {
    let result;
    if (this.softDelete) {
      const items = await this.fetchAll(conditions);
      await Promise.all(items.map(async (anItem) => {
        const item = anItem;
        item.deleted = true;
        result = await item._saveWithTrx(trx);
        return result;
      }));
    } else {
      result = await this.table
        .where(conditions)
        .del()
        .transacting(trx);
      if (result === 0) return null;
    }
    return result;
  }

  /**
   * Returns rows from model's table
   * @param {object} conditions
   * @param {integer} offset
   * @param {integer} limit
   * @return {object}
   */
  static async fetchAll(conditions = {}, primaryKeyIds = []) {
    const query = this.table.where(conditions);
    this._addSoftDeletionConditionIfNeeded(query);
    if (primaryKeyIds.length > 0) {
      query.whereIn(this.primaryKeyName, primaryKeyIds);
    }

    return query.map(row => this.initializeModel(row));
  }


  static get updateTimestampKey() {
    return 'updatedAt';
  }

	static get relations() {
		return [];
	}

	static get calculatedFieldNames() {
		return [];
	}

	static get foreignKeyName() {
		const singularForm = pluralize.singular(this.tableName);
		return `${singularForm}${capitalize(this.primaryKeyName)}`;
	}

	saveHasManyRelations(trx) {
		this.constructor.hasMany.forEach(async (relatedInfo) => {
			const relatedModelIdsFieldName = pluralize(relatedInfo.entity.foreignKeyName);
			if (this[relatedModelIdsFieldName]) {
				const conditions = {};
				conditions[this.constructor.foreignKeyName] = this.primaryKeyValue;
				const hasManyFieldName = `_${camelize(relatedInfo.through.tableName)}`;
				this[hasManyFieldName] = [];
				await relatedInfo.through.deleteWithTrx(conditions, trx);
				this[relatedModelIdsFieldName].forEach(async (relatedModelId) => {
					const throughRecord = {};
					throughRecord[this.constructor.foreignKeyName] = this.primaryKeyValue;
					throughRecord[relatedInfo.entity.foreignKeyName] = relatedModelId;
					throughRecord.currentUserEmail = this.currentUserEmail;
					const record = await relatedInfo.through.createWithTrx(throughRecord, trx);
					this[hasManyFieldName].push(record);
				});
			}
		});
	}

	static get hasMany() {
		// { entity: Model, through: JoinModel }
		return [];
	}

  async _saveWithTrx(trx) {
    this[this.constructor.updateTimestampKey] = new Date().toISOString();
    const row = this.rowObject;
    if (this.constructor.softDelete) {
      row.deleted = this.deleted || false;
    }
    const result = await this.constructor.table
      .where(this.identifierParams)
      .update(row)
      .returning('*');
    if (result) {
      await this.saveHasManyRelations(trx);
      // await this.track(trx);
      return this;
    }
    return false;
  }

  /**
   * Inserts new row into a models table
   * @param {object} object
   * @param {object}trx
   */
  static async createWithTrx(object, trx) {
    let record = new this(object);
    const result = await this.table
      .insert(record.rowObject)
      .returning('*')
      .transacting(trx);
    if (result) {
      record = new this(result[0]);
      record.currentUserEmail = this.requestNamespace.get('currentUserEmail');
      // await record.saveHasManyRelations(trx, object);
      // await record.track(trx);
      return record;
    }
    return null;
  }

  /**
   * Inserts new row into a models table
   * @param {object} object
   */
  static async create(object) {
    let record = null;
    await this.connection.transaction(async (trx) => {
      record = await this.createWithTrx(object, trx);
    });
    return record;
  }

  /**
   * Updates an existing model
   * @param {object} object of model
   * @param {string|int} primaryKeyValue
   */
  static async update(object, primaryKeyValue) {
    const idCondition = {};
    idCondition[this.primaryKeyName] = primaryKeyValue;
    const currentObject = await this.findOne(idCondition);

    this.checkIfColumnsCanBeUpdated(object, currentObject);

    if (!currentObject) {
      throw new Error(`There is no row for ${idCondition}`);
    }

    Object.assign(currentObject, object);

    await currentObject.save();
    return currentObject;
  }

  /**
  * Empties table of a model
  * @return {integer} number of rows affected
  */
  static async deleteAll() {
    return this.table.del();
  }

  /**
     * Bulk insert with option to use existing transaction.
     * @param {Array} rows
     * @param {number} chunkSize
     * @returns {Promise<*>}
     */
  static async _bulkInsert(objects, chunkSize = 20) {
    let records = [];
    await this.connection.transaction(async (trx) => {
      records = await this._bulkInsertWithTrx(objects, chunkSize, trx);
    });
    return records;
  }

  /**
     * Inserts multiple number of rows into a table
     * @param {array} rows
     * @param {integer} chunkSize
     * @param {object}trx
     */
  static async _bulkInsertWithTrx(objects, chunkSize = 20, trx) {
    const rows = objects.map((row) => {
      const record = new this(row);
      return record.rowObject;
    });

    const records = await this.connection
      .batchInsert(this.tableName, rows, chunkSize)
      .returning('*')
      .transacting(trx);

		return records.map(record => new this(record));
  }

  /**
     * A list of columns that cannot be updated
     */
  static get permanentColumns() {
    return [];
  }

  static checkIfColumnsCanBeUpdated(updateParams, existingRow) {
    if (this.permanentColumns.length > 0) {
      const paramKeys = Object.keys(updateParams);
      for (let i = 0; i < paramKeys.length; i++) {
        const fieldName = paramKeys[i];
        if (this.permanentColumns.includes(fieldName)) {
          if (updateParams[fieldName] !== existingRow[fieldName]) {
            throw new Error(`The field ${fieldName} cannot be updated. It is a permanent field`);
          }
        }
      }
    }
  }

  static _includeJoinFilter(query, callerJoins) {
    let results = query;

    // handle wrong project id
    if (this.relations) {
      const relations = this.relations.filter(foreignTable => foreignTable.type === 'join');
      relations.forEach((foreignTable) => {
        const foreign = callerJoins[foreignTable.tableName];
        results = results
          .innerJoin(foreign.relationTable, `${foreign.relationTable}.${foreign.foreignKey}`, `${this.tableName}.${this.primaryKey}`)
          .where(`${foreign.relationTable}.${foreign.otherTableForeignKey}`, foreign.otherTableKeyValue);
      });
    }
    return results;
  }

  static identifierName() {
    return 'id';
  }

  get rowObject() {
    const result = {};
    this.constructor.fieldNames.forEach((name) => {
      result[name] = this[name];
    });
    return result;
  }

  static get columnRelations() {
    return [];
  }


	static addColumnRelations(query) {
		let result = query;

		this.columnRelations.forEach((relationClass) => {
			const relationTableName = relationClass.tableName;

			console.log("$$$$$$$$$$$$$$$$$$");
			console.log(relationTableName);
      console.log("$$$$$$$$$$$$$$$$$$");
			let {relationName} = relationClass;
			relationName = !relationName ? pluralize.singular(relationTableName) : relationName;

			result = result.select(
				this.connection.raw(
					`row_to_json((SELECT ${relationName} FROM (SELECT ${relationClass.rawFieldNamesWithTableName.join(
						', ',
					)} ) ${relationName} ) ) AS ${relationName}`,
				),
			);
			result = result
				.leftOuterJoin(
					relationTableName,
					`${this.tableName}.${relationName}${capitalize(relationClass.primaryKeyName)}`,
					`${relationTableName}.${relationClass.primaryKeyName}`,
				)
				.whereRaw(`(${relationTableName}.${relationClass.primaryKeyName} = ${this.tableName}."${relationName}${capitalize(relationClass.primaryKeyName)}")`)
				.groupBy(`${relationTableName}.${relationClass.primaryKeyName}`);
		});

		return result;
	}

  static async closeConnection() {
    await this.connection.destroy();
  }

  static get connection() {
    /* eslint-disable global-require */
    return require('../../../db/knex').connection;
  }

  get identifierParams() {
    const result = {};
    result[this.constructor.primaryKeyName] = this.primaryKeyValue;
    return result;
  }

  static get primaryKey() {
    return 'id';
  }

  get primaryKeyValue() {
    return this[this.constructor.primaryKeyName];
  }

  save() {
    return this.constructor.connection.transaction(trx => this._saveWithTrx(trx));
  }
}
