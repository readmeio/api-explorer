module.exports = (oas, apiSetting) => {
  const docs = [];

  Object.keys(oas.paths).map((path) => {
    return Object.keys(oas.paths[path]).map((method) => {
      const operation = oas.paths[path][method];
      let isCategory;
      if (!docs.find(category => category.slug === operation.tags[0] && category.type === 'basic')) {
        docs.push({
          _id: Math.random().toString(16),
          title: operation.tags[0],
          slug: operation.tags[0],
          type: 'basic',
          category: { apiSetting },
          api: { method },
          swagger: { path },
        });
        isCategory = true;
      }

      if (!isCategory) {
        docs.push({
          _id: Math.random().toString(16),
          title: operation.summary,
          slug: operation.operationId,
          type: 'endpoint',
          category: { apiSetting },
          api: { method },
          swagger: { path },
        });
      }
    });
  });

  return docs;
};
