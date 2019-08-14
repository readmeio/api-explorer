const React = require('react');
const PropTypes = require('prop-types');

const markdown = require('@readme/markdown');
const findSchemaDefinition = require('./lib/find-schema-definition');

const flatten = list => list.reduce((a, b) => a.concat(Array.isArray(b) ? flatten(b) : b), []);
const getName = (parent, prop) => {
  if (!parent) return prop;
  if (parent[parent.length - 1] === ' ') return `${parent}${prop}`;

  return `${parent}.${prop}`;
};
const capitalizeFirstLetter = (string = '') => string.charAt(0).toUpperCase() + string.slice(1);

function getSchemaType(schema) {
  if (schema.type !== 'array') {
    return schema.type;
  }
  if (schema.items.$ref) {
    return 'array of objects';
  }
  return `array of ${schema.items.type}s`;
}

/* eslint-disable no-use-before-define */
function flattenObject(obj, parent, level, oas) {
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
        let items = value.items;
        if (items.$ref) {
          items = findSchemaDefinition(items.$ref, oas);
        }
        if (items.type) {
          array.push({
            name: getName(parent, prop),
            type: `[${capitalizeFirstLetter(items.type)}]`,
            description: value.description,
          });
        }
        const newParent = parent ? `${parent}.` : '';
        if (items.type === 'object') {
          array.push(flattenResponseSchema(items, oas, `${newParent}${prop}[]`, level + 1));
        }
        return array;
      }

      array.unshift({
        name: getName(parent, prop),
        type: capitalizeFirstLetter(value.type),
        description: value.description,
      });
      return array;
    }),
  );
}
/* eslint-enable no-use-before-define */

function flattenResponseSchema(obj, oas, parent = '', level = 0) {
  if (level > 2) {
    return [];
  }
  let newParent;
  // top level array
  if (obj.type === 'array' && obj.items) {
    if (obj.items.$ref) {
      const value = findSchemaDefinition(obj.items.$ref, oas);
      return flattenResponseSchema(value, oas);
    }
    newParent = parent ? `${parent}.[]` : '';
    return flattenResponseSchema(obj.items, oas, `${newParent}`, level + 1);
  }

  if (obj && !obj.properties) {
    return [];
  }

  return flattenObject(obj, parent, level, oas);
}

function ResponseSchemaBody({ schema, oas }) {
  const rows = flatten(flattenResponseSchema(schema, oas)).map(row => (
    <tr key={Math.random().toString(10)}>
      <th
        style={{
          whiteSpace: 'nowrap',
          width: '30%',
          paddingRight: '5px',
          textAlign: 'right',
          overflow: 'hidden',
        }}
      >
        {row.type}
      </th>
      <td
        style={{
          width: '70%',
          overflow: 'hidden',
          paddingLeft: '15px',
        }}
      >
        {row.name}
        {row.description && markdown(row.description)}
      </td>
    </tr>
  ));

  return (
    <div>
      {schema && schema.type && (
        <p style={{ fontStyle: 'italic', margin: '0 0 10px 15px' }}>
          {`Response schema type: `}
          <span style={{ fontWeight: 'bold' }}>{getSchemaType(schema)}</span>
        </p>
      )}
      <table style={{ tableLayout: 'fixed' }}>
        <tbody>{rows}</tbody>
      </table>
    </div>
  );
}

module.exports = ResponseSchemaBody;

ResponseSchemaBody.propTypes = {
  schema: PropTypes.shape({}).isRequired,
  oas: PropTypes.shape({}).isRequired,
};

module.exports.flattenResponseSchema = flattenResponseSchema;
module.exports.flatten = flatten;
