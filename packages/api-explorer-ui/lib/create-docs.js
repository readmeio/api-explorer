module.exports = (oas, apiSetting) => {
  const docs = [];

  Object.keys(oas.paths).map((path) => {
    return Object.keys(oas.paths[path]).forEach((method) => {
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
            "text": "This is text area"
          }
          [/block]
          [block:html]
          {
            "html": "<p>This is an html</p>"

          }
          [/block]
          [block:api-header]
          {
            "title": "This is cool header",
            "sidebar": true
          }
          [/block]

          [block:callout]
          {
            "type": "info",
            "title": "Callout"
          }
          [/block]

          [block:image]
          {
             "images": [
              {
                "image": [
                  "https://files.readme.io/924824e-fullsizeoutput_314.jpeg",
                  "fullsizeoutput_314.jpeg",
                  640,
                  1136,
                  "#c8b396"
                ]
              }
            ]
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

          [block:code]
          {
            "codes": [
               {
                  "code": "whjdwhjwejhkwhjk",
                  "language": "text",
                  "status": 400,
                  "name": "    "
                },
                {
                  "code": "var a = 1;",
                  "language": "javascript"
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

        [block:embed]
        {
          "html": "<iframe class=\\"embedly-embed\\" src=\\"//cdn.embedly.com/widgets/media.html?src=https%3A%2F%2Fwww.youtube.com%2Fembed%2FjYjDqzZ4gjY%3Ffeature%3Doembed&url=http%3A%2F%2Fwww.youtube.com%2Fwatch%3Fv%3DjYjDqzZ4gjY&image=https%3A%2F%2Fi.ytimg.com%2Fvi%2FjYjDqzZ4gjY%2Fhqdefault.jpg&key=f2aa6fc3595946d0afc3d76cbbd25dc3&type=text%2Fhtml&schema=youtube\\" width=\\"640\\" height=\\"480\\" scrolling=\\"no\\" frameborder=\\"0\\" allowfullscreen></iframe>",
          "url": "https://www.youtube.com/watch?v=jYjDqzZ4gjY",
          "title": "White kids Watch me whip school Chorus - chorus white kids singing Watch me whip",
          "favicon": "https://s.ytimg.com/yts/img/ringo/img/favicon-vfl8qSV2F.ico",
          "image": "https://i.ytimg.com/vi/jYjDqzZ4gjY/hqdefault.jpg",
          "sidebar": true
        }
        [/block]

          `,
        });
      }
    });
  });

  return docs;
};
