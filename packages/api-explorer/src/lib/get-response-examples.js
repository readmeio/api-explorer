const { findSchemaDefinition } = require('@readme/oas-tooling/utils');

function getMediaType(response) {
  return response.content ? Object.keys(response.content)[0] : '';
}

function getMediaTypes(response) {
  return response.content ? Object.keys(response.content) : '';
}

function hasMultipleMediaTypes(response) {
  return response.content ? Object.keys(response.content).length > 1 : false;
}

function getExample(response, lang, oas) {
  if (response.content[lang].example) {
    // According to the OAS spec, the singular `example` keyword does **not** support `$ref` pointers.
    // https://swagger.io/docs/specification/adding-examples/

    return response.content[lang].example;
  } else if (response.content[lang].examples) {
    // This isn't actually something that's defined in the spec. Do we really need to support this?
    const customResponse = response.content[lang].examples.response;
    if (customResponse) {
      if (customResponse.value.$ref) {
        return findSchemaDefinition(customResponse.value.$ref, oas);
      }
      return customResponse.value;
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
        if ('$ref' in example.value) {
          return findSchemaDefinition(example.value.$ref, oas);
        }
        return example.value;
      }
    }

    return example;
  }

  return false;
}

function getMultipleExamples(response, mediaType, oas) {
  if (!response.content[mediaType].examples || response.content[mediaType].examples.response) return false;

  const { examples } = response.content[mediaType];
  const multipleExamples = Object.keys(examples).map(key => {
    let example = examples[key];
    if (example !== null && typeof example === 'object') {
      if ('$ref' in example.value) {
        example = findSchemaDefinition(example.value.$ref, oas);
      } else if ('value' in example) {
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

function constructMediaType(mediaType, response, example, oas) {
  const multipleExamples = getMultipleExamples(response, mediaType, oas);
  if (!example && !multipleExamples) {
    return false;
  }

  return {
    language: mediaType,
    code: example !== null && typeof example === 'object' ? JSON.stringify(example, undefined, 2) : example,
    multipleExamples: !example ? multipleExamples : false,
  };
}

module.exports = (pathOperation, oas) => {
  pathOperation._cache = pathOperation._cache || {};
  if (pathOperation._cache.responseExamples) {
    return pathOperation._cache.responseExamples;
  }

  pathOperation._cache.responseExamples = Object.keys(pathOperation.responses || {})
    .map(status => {
      let response = pathOperation.responses[status];

      // @todo This should really be called higher up when the OAS is processed within the Doc component.
      if (response.$ref) {
        response = findSchemaDefinition(response.$ref, oas);
      }

      const mediaTypes = [];

      if (hasMultipleMediaTypes(response)) {
        getMediaTypes(response).forEach(mediaType => {
          if (!mediaType) return false;

          const langResponse = response.content[mediaType];
          const example = langResponse.code || getExample(response, mediaType, oas);
          const cmt = constructMediaType(mediaType, response, example, oas);
          if (cmt) {
            mediaTypes.push(cmt);
          }

          return true;
        });
      } else {
        const mediaType = response.langauge || getMediaType(response);
        if (!mediaType) return false;

        const example = response.code || getExample(response, mediaType, oas);
        const cmt = constructMediaType(mediaType, response, example, oas);
        if (cmt) {
          mediaTypes.push(cmt);
        }
      }

      // If we don't have any languages or media types to show here, don't bother return anything.
      if (mediaTypes.length === 0) return false;

      return {
        status,

        // This should return a mediaTypes object instead of `languages`, but since `response.language` is integrated
        // into our legacy manual editor, we'll leave this alone for now.
        // @todo
        languages: mediaTypes,
      };
    })
    .filter(Boolean);

  return pathOperation._cache.responseExamples;
};
