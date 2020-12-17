/**
 * This file has been extracted and modified from Swagger UI.
 *
 * @license Apache 2.0
 * @link https://github.com/swagger-api/swagger-js/blob/e5d83c7c8395baf1e30a16e636aabe3bba21360e/src/execute/oas3/content-serializer.js
 */

/*
  Serializer that serializes according to a media type instead of OpenAPI's
  `style` + `explode` constructs.
*/

module.exports = function serialize(value, mediaType) {
  if (mediaType.includes('application/json')) {
    if (typeof value === 'string') {
      // Assume the user has a JSON string
      return value;
    }
    return JSON.stringify(value);
  }

  return value.toString();
};
