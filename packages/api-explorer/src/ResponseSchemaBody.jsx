const React = require('react');
const PropTypes = require('prop-types');

const marked = require('../../markdown/index');
const findSchemaDefinition = require('./lib/find-schema-definition');

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
const getName = (parent, prop) => {
  if (!parent) return prop;
  if (parent[parent.length - 1] === ' ') return `${parent}${prop}`;

  return `${parent}.${prop}`;
};
function flattenResponseSchema(obj, oas, parent = '', level = 0) {
  const prefix = new Array(level + 2).join('| ');
  if (level > 2) {
    return [];
  }

  // top level array
  if (obj.type === 'array' && obj.items) {
    if (obj.items.$ref) {
      const value = findSchemaDefinition(obj.items.$ref, oas);
      return flattenResponseSchema(value, oas);
    }

    return flattenResponseSchema(obj.items, oas);
  }

  if (obj && !obj.properties) {
    return [];
  }

  return flatten(
    Object.keys(obj.properties).map(prop => {
      let value = obj.properties[prop];
      const array = [];
      if (value.$ref) {
        value = findSchemaDefinition(value.$ref, oas);
      }

      if (value.type === 'object') {
        array.push(flattenResponseSchema(value, oas, getName(parent, prop), level + 1));
      }

      if (value.type === 'array' && value.items) {
        if (value.items.$ref) {
          value.items = findSchemaDefinition(value.items.$ref, oas);
        }
        if (value.items.type) {
          array.push({
            name: getName(parent, prop),
            type: `array of ${value.items.type}s`,
            description: value.description,
          });
        }
        if (value.items.type === 'object') {
          array.push(flattenResponseSchema(value.items, oas, `${prefix}`, level + 1));
        }
        return array;
      }

      array.unshift({
        name: getName(parent, prop),
        type: value.type,
        description: value.description,
      });
      return array;
    }),
  );
}

function ResponseSchemaBody({ schema, oas }) {
  const rows = flattenResponseSchema(schema, oas).map(row => (
    <tr key={Math.random().toString(10)}>
      <th style={{ whiteSpace: 'nowrap' }}>{row.name}</th>
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
