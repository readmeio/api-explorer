const React = require('react');
const PropTypes = require('prop-types');
const marked = require('./lib/markdown/index');

function recurse(obj, parent = '') {
  return Object.keys(obj.properties)
    .map(prop => {
      if (obj.properties[prop].properties) {
        return recurse(obj.properties[prop], prop);
      } else if (obj.properties[prop].type === 'array' && obj.properties[prop].items.properties) {
        return recurse(obj.properties[prop].items, prop);
      }
      return [
        {
          objName: parent ? `${parent}.${prop}` : prop,
          type: obj.properties[prop].type,
          description: obj.properties[prop].description && marked(obj.properties[prop].description),
        },
      ];
    })
    .reduce((a, b) => a.concat(b));
}

function ResponseSchemaBody({ schema }) {
  const rows = recurse(schema).map(row => (
    <tr>
      <th>{row.objName}</th>
      <td>
        {row.type}
        {row.description}
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
};

module.exports.recurse = recurse;
