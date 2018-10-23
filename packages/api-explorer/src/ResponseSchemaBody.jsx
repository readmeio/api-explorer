const React = require('react');
const PropTypes = require('prop-types');

const marked = require('../../markdown/index');
const findSchemaDefinition = require('./lib/find-schema-definition');

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
function flattenResponseSchema(obj, oas, parent = '') {
  if (obj && !obj.properties) {
    return [];
  }
  const arrayOfObjects = Object.keys(obj.properties).map(prop => {
    let value = obj.properties[prop];
    const array = [];
    if (value.$ref) {
      value = findSchemaDefinition(value.$ref, oas);
      array.push(flattenResponseSchema(value, oas, prop));
    }

    array.unshift({
      name: parent ? `${parent}.${prop}` : prop,
      type: value.type,
      description: value.description,
    });
    return array;
  });
  return flatten(arrayOfObjects);
}

function ResponseSchemaBody({ schema, oas }) {
  const rows = flattenResponseSchema(schema, oas).map(row => (
    <tr key={row.name}>
      <th>{row.name}</th>
      <td>
        {row.type}
        {row.description && marked(row.description)}
      </td>
    </tr>
  ));

  return (
    <table>
      <tbody>{rows}</tbody>
    </table>
  );
}

module.exports = ResponseSchemaBody;

ResponseSchemaBody.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  oas: PropTypes.shape({}).isRequired,
};

module.exports.flattenResponseSchema = flattenResponseSchema;
module.exports.flatten = flatten;
