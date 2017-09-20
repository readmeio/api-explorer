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
          body: `
          [block:textarea]
           {
             "text": "This is text area."
           }
          [/block]
          [block:image]
          {
            "images": [
              {
                "image": [
                  "https://files.readme.io/dce21f0-IMG_0418.JPG",
                  "IMG_0418.JPG",
                  640,
                  1136,
                  "#9e918d"
                ],
                "caption": "doggo"
              }
            ]
          }
          [/block]

         [block:parameters]
         {
          "data": {
            "0-0": "arbitrary",
            "0-1": "info",
            "0-2": "test",
            "h-0": "test",
            "h-1": "1",
            "h-2": "2"
          },
          "cols": 3,
          "rows": 1
        }
        [/block]

          `,
          excerpt: operation.description,
        });
      }
    });
  });

  return docs;
};
