const { findSchemaDefinition } = require('@readme/oas-tooling/utils');

function getLanguage(response) {
  return response.content ? Object.keys(response.content)[0] : '';
}

function getLanguages(response) {
  return response.content ? Object.keys(response.content) : '';
}

function hasMultipleLanguages(response) {
  return response.content ? Object.keys(response.content).length > 1 : false;
}

function getExample(response, lang) {
  if (!response.content[lang].examples) {
    return false;
  }

  // This isn't actually something that's defined in the spec. Do we really need to support this?
  if (response.content[lang].examples.response) {
    return response.content[lang].examples.response.value;
  }

  const examples = Object.keys(response.content[lang].examples);
  if (examples.length > 1) {
    // Since we're trying to return a single example with this method, but have multiple present,
    // return `false` so `getMultipleExamples` will pick up this response instead later.
    return false;
  }

  let example = examples[0];
  example = response.content[lang].examples[example];
  if (example !== null && typeof example === 'object') {
    if ('value' in example) {
      return example.value;
    }
  }

  return example;
}

function getMultipleExamples(response, lang) {
  if (!response.content[lang].examples || response.content[lang].examples.response) return false;

  const { examples } = response.content[lang];
  const multipleExamples = Object.keys(examples).map(key => {
    let example = examples[key];
    if (example !== null && typeof example === 'object') {
      if ('value' in example) {
        example = example.value;
      }

      example = JSON.stringify(example, undefined, 2);
    }

    return {
      label: key,
      code: example,
    };
  });

  return multipleExamples.length > 0 ? multipleExamples : false;
}

function constructLanguage(language, response, example) {
  const multipleExamples = getMultipleExamples(response, language);
  if (!example && !multipleExamples) {
    return false;
  }

  return {
    language,
    code: example !== null && typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
    multipleExamples: !example ? multipleExamples : false,
  };
}

module.exports = type => {
  return (pathOperation, oas) => {
    // Only working for results
    if (type !== 'results') return [];

    pathOperation._cache = pathOperation._cache || {};

    if (pathOperation._cache[type]) return pathOperation._cache[type];

    const codes = Object.keys(pathOperation.responses || {})
      .map(status => {
        let response = pathOperation.responses[status];

        // @todo This should really be called higher up when the OAS is processed within the Doc component.
        if (response.$ref) {
          response = findSchemaDefinition(response.$ref, oas);
        }

        // @todo We should really be calling these `mediaTypes`, not `languages`.
        const languages = [];

        if (hasMultipleLanguages(response)) {
          getLanguages(response).forEach(language => {
            if (!language) return false;

            const langResponse = response.content[language];
            const example = langResponse.code || getExample(response, language);
            const clang = constructLanguage(language, response, example);
            if (clang) {
              languages.push(clang);
            }

            return true;
          });
        } else {
          const language = response.langauge || getLanguage(response);
          if (!language) return false;

          const example = response.code || getExample(response, language);
          const clang = constructLanguage(language, response, example);
          if (clang) {
            languages.push(clang);
          }
        }

        // If we don't have any languages or media types to show here, don't bother return anything.
        if (languages.length === 0) return false;

        return {
          status,
          languages,
        };
      })
      .filter(Boolean);

    pathOperation._cache[type] = codes;
    return codes;
  };
};
