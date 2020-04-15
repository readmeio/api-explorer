/**
 * With https://github.com/readmeio/api-explorer/pull/312 we changed the shape of response
 * examples, but unfortunately APIs that are manually documented in ReadMe are still in the
 * legacy shape so we need to adhoc rewrite them to fit this new work.
 *
 * Once we do away with our legacy manual API documentation system and move to OAS for everything,
 * this code can be removed.
 *
 * @param {array} responses
 * @returns
 */
module.exports = responses => {
  const codes = {};

  responses.forEach(response => {
    // If there's no status set, then the legacy response wasn't full set up so we should ignore it.
    if (!('status' in response)) {
      return;
    }

    if (typeof codes[response.status] === 'undefined') {
      codes[response.status] = {
        languages: {},
      };
    }

    if (typeof codes[response.status].languages[response.language] === 'undefined') {
      codes[response.status].languages[response.language] = [];
    }

    codes[response.status].languages[response.language].push({
      label: response.name,
      code: response.code,
    });
  });

  return Object.keys(codes)
    .map(status => {
      const data = codes[status];
      const languages = [];

      Object.keys(data.languages).map(language => {
        if (data.languages[language].length === 1) {
          languages.push({
            code: data.languages[language][0].code,
            language,
            multipleExamples: false,
          });

          return true;
        }

        languages.push({
          code: false,
          language,
          multipleExamples: data.languages[language].map(l => {
            return {
              label: l.label !== '' ? l.label : language,
              code: l.code,
            };
          }),
        });

        return true;
      });

      return {
        status: parseInt(status, 10),
        languages,
      };
    })
    .filter(Boolean);
};
