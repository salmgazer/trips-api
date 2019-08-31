const projects = () => ({
  tableName: 'projects', foreignKey: 'projectId', type: 'simple', paramName: 'project_id',
});

const sites = () => ({
  tableName: 'sites', foreignKey: 'siteId', type: 'simple', paramName: 'site_id',
});

module.exports = {
  projects,
  sites,
};

