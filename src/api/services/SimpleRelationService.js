export default class SimpleRelationService {
  getSimpleRelations(modelClass, req, params) {
    const updatedParams = params;
    if (!modelClass.relations) return params;
    const relations = modelClass.relations.filter(foreignTable => foreignTable.type === 'simple');

    relations.forEach((foreignTable) => {
      if (req.swagger.params[foreignTable.paramName]) {
        updatedParams[foreignTable.foreignKey] = req.swagger.params[foreignTable.paramName].value;
      }
    });
    return updatedParams;
  }
}
