// const body = `
// \`\`\`javascript
// var a = '<<apiKey>>';
// var b = "<<apiKey>>";
// \`\`\`
// This is your <<apiKey>>.

// [link](doc:link)

// [block:code]
// {
//   "codes": [
//     {
//       "code": "<p>test</p>",
//       "language": "html"
//     },
//     {
//       "code": "var a = '<<apiKey>>';",
//       "language": "javascript"
//     },
//     {
//       "code": "& < > ' /",
//       "language": "text"
//     }
//   ]
// }
// [/block]

// testing
// correctnewlines
// option
// `;

module.exports = (oas, apiSetting) => {
  const docs = [];

  Object.keys(oas.paths).map(path => {
    return Object.keys(oas.paths[path]).forEach(method => {
      const operation = oas.paths[path][method];
      let isCategory;

      const tag = operation.tags && operation.tags.length ? operation.tags[0] : path;
      if (!docs.find(category => category.slug === tag && category.type === 'basic')) {
        // If the method present isn't an HTTP method that we're aware of, ignore it. This can
        // happen in the case of an API definition using something like common parameters.
        // https://swagger.io/docs/specification/describing-parameters
        if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace'].includes(method)) {
          return;
        }

        docs.push({
          _id: Math.random().toString(16),
          title: operation.summary || path || tag,
          slug: path
            .replace(/^\W|\W$/, '')
            .replace(/\W+/g, '-')
            .replace(/^\W|\W$/, ''),
          type: 'endpoint',
          category: { apiSetting },
          api: {
            method,
            // Uncomment this if you want to test custom code samples
            // examples: {
            //   codes: [
            //     {
            //       language: 'javascript',
            //       code: 'console.log(1);',
            //     },
            //     {
            //       language: 'curl',
            //       code: 'curl http://example.com',
            //     },
            //   ],
            // },
          },
          swagger: { path },
          excerpt: operation.description,
          // Uncomment this if you want some body content blocks
          // body,
        });
        isCategory = true;
      }

      if (!isCategory) {
        docs.push({
          _id: Math.random().toString(16),
          title: operation.summary || path || tag,
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
