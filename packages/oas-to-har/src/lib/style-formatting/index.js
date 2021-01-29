const stylize = require('./style-serializer');

// Certain styles don't support empty values, This function tracks that list
function shouldNotStyleEmptyValues(parameter) {
  return ['simple', 'spaceDelimited', 'pipeDelimited', 'deepObject'].includes(parameter.style);
}

function shouldNotStyleReservedHeader(parameter) {
  return ['accept', 'authorization', 'content-type'].includes(parameter.name.toLowerCase());
}

// Note: This isn't necessarily part of the spec. Behavior for the value 'undefined' is, well, undefined.
//   This code makes our system look better. If we wanted to be more accurate, we might want to remove this,
//   restore the un-fixed behavior for undefined and have our UI pass in empty string instead of undefined.
function removeUndefinedForPath(value) {
  let finalValue = value;

  if (typeof finalValue === 'undefined') {
    return '';
  }

  if (Array.isArray(finalValue)) {
    finalValue = finalValue.filter(val => (val === undefined ? '' : val));

    if (finalValue.length === 0) {
      finalValue = '';
    }
  }

  if (typeof finalValue === 'object') {
    Object.keys(finalValue).forEach(key => {
      finalValue[key] = finalValue[key] === undefined ? '' : finalValue[key];
    });
  }

  return finalValue;
}

function stylizeValue(value, parameter) {
  let finalValue = value;

  // Some styles don't work with empty values. We catch those there
  if (shouldNotStyleEmptyValues(parameter) && (typeof finalValue === 'undefined' || finalValue === '')) {
    // Paths need return an unstyled empty string instead of undefined so it's ignored in the final path string
    if (parameter.in === 'path') {
      return '';
    }
    // Everything but path should return undefined when unstyled so it's ignored in the final parameter array
    return undefined;
  }

  // Every style that adds their style to empty values should use emptystring for path parameters instead of undefined to avoid the string 'undefined'
  if (parameter.in === 'path') {
    finalValue = removeUndefinedForPath(finalValue);
  }

  // Eventhough `Accept`, `Authorization`, and `Content-Type` headers can be defined as parameters, they should be
  // completely ignored when it comes to serialization.
  //
  //  > If in is "header" and the name field is "Accept", "Content-Type" or "Authorization", the parameter definition
  //  > SHALL be ignored.
  //
  // https://github.com/OAI/OpenAPI-Specification/blob/master/versions/3.0.3.md#fixed-fields-10
  if (parameter.in === 'header' && shouldNotStyleReservedHeader(parameter)) {
    return value;
  }

  return stylize({
    value: finalValue,
    key: parameter.name,
    style: parameter.style,
    explode: parameter.explode,
    /*
      TODO: this parameter is optional to stylize. It defaults to false, and can accept falsy, truthy, or "unsafe".
      I do not know if it is correct for query to use this. See style-serializer for more info
    */
    escape: true,
  });
}

// Explode is handled on its own, because style-serializer doesn't return what we expect for proper HAR output
function handleExplode(value, parameter) {
  if (Array.isArray(value)) {
    return value.map(val => {
      return stylizeValue(val, parameter);
    });
  }

  if (typeof value === 'object') {
    const newObj = {};

    Object.keys(value).forEach(key => {
      const stylizedValue = stylizeValue(value[key], parameter);

      if (parameter.style === 'deepObject') {
        newObj[`${parameter.name}[${key}]`] = stylizedValue;
      } else {
        newObj[key] = stylizedValue;
      }
    });

    return newObj;
  }

  return stylizeValue(value, parameter);
}

function shouldExplode(parameter) {
  return (
    (parameter.explode || (parameter.explode !== false && parameter.style === 'form')) &&
    // header and path doesn't explode into separate parameters like query and cookie do
    parameter.in !== 'header' &&
    parameter.in !== 'path'
  );
}

module.exports = function formatStyle(value, parameter) {
  // Deep object only works on exploded non-array objects
  if (parameter.style === 'deepObject' && (!value || value.constructor !== Object || parameter.explode === false)) {
    return undefined;
  }

  // This custom explode logic allows us to bubble up arrays and objects to be handled differently by our HAR transformer
  //  We need this because the stylizeValue function assumes we're building strings, not richer data types
  // The first part of this conditional checks if explode is enabled. Explode is disabled for everything by default except for forms.
  // The second part of this conditional bypasses the custom explode logic for headers, because they work differently, and stylizeValue is accurate
  if (shouldExplode(parameter)) {
    return handleExplode(value, parameter);
  }

  return stylizeValue(value, parameter);
};
