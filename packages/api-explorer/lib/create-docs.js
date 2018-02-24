// const body = `
// [Test doc link](doc:doc-slug)
// [Test blog link](blog:blog-slug)
// [Test page link](page:page-slug)
// [block:api-header]
// {
//   "title": "This is cool header",
//   "sidebar": true
// }
// [/block]
// [block:textarea]
// {
//   "text": "This is text area"
// }
// [/block]
// [block:code]
// {
//   "codes": [
//     {
//       "code": "var a = 1;",
//       "language": "javascript"
//     },
//     {
//       "code": "System.out.println('Hello World!');",
//       "language": "java",
//       "name": "Java"
//     },
//     {
//       "code": "<h1>HTML</h1>",
//       "language": "html",
//       "name": "HTML"
//     }
//   ]
// }
// [/block]`;

module.exports = (oas, apiSetting) => {
  const docs = [];

  Object.keys(oas.paths).map(path => {
    return Object.keys(oas.paths[path]).forEach(method => {
      const operation = oas.paths[path][method];
      let isCategory;

      const tag = operation.tags && operation.tags.length ? operation.tags[0] : path;
      if (!docs.find(category => category.slug === tag && category.type === 'basic')) {
        docs.push({
          _id: Math.random().toString(16),
          title: operation.summary || tag,
          slug: tag,
          type: 'endpoint',
          category: { apiSetting },
          api: { method },
          swagger: { path },
          // Uncomment this if you want some body content blocks
          // body,
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
