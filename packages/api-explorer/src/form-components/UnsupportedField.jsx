const PropTypes = require('prop-types');

function UnsupportedField({ schema, idSchema, reason }) {
  let message = 'Unsupported field schema';
  if (idSchema && idSchema.$id) {
    message += ` for field \`${idSchema.$id}\``;
  }

  if (reason) {
    message += `: ${reason}.`;
  }

  const error = new Error(message);

  if (schema) error.schema = schema;

  throw error;
}

UnsupportedField.propTypes = {
  idSchema: PropTypes.object,
  reason: PropTypes.string,
  schema: PropTypes.object.isRequired,
};

module.exports = UnsupportedField;
