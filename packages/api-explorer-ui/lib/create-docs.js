module.exports = (oas, apiSetting) => {
  const docs = [];

  Object.keys(oas.paths).map(path => {
    return Object.keys(oas.paths[path]).forEach(method => {
      const operation = oas.paths[path][method];
      let isCategory;

      const tag = operation.tags ? operation.tags[0] : path;
      if (!docs.find(category => category.slug === tag && category.type === 'basic')) {
        docs.push({
          _id: Math.random().toString(16),
          title: tag,
          slug: tag,
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
          body: '',
          excerpt: operation.description,
        });
      }
    });
  });

  return docs;
};
