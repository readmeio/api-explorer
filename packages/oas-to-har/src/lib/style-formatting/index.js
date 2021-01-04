const stylize = require('./style-serializer');

function stylizeValue(value, parameter) {
  return stylize({
    value,
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

// Certain styles don't support empty values, This function tracks that list
function shouldNotStyleEmptyValues(parameter) {
  return ['simple', 'spaceDelimited', 'pipeDelimited', 'deepObject'].includes(parameter.style);
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
  // Many styles don't work with empty values
  if ((typeof value === 'undefined' || value === '') && shouldNotStyleEmptyValues(parameter)) {
    // when we return anything but path, the system understands undefined as "don't include". For path, it appends the string undefined. So we bypass that logic here.
    if (parameter.in === 'path') {
      return '';
    }
    return undefined;
  }

  // Deep object only works on exploded objects
  if (parameter.style === 'deepObject' && (typeof value !== 'object' || parameter.explode === false)) {
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
