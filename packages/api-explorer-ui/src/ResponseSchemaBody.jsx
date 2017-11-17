const React = require('react');
const PropTypes = require('prop-types');
const marked = require('./lib/markdown/index');

function ResponseSchemaBody({ schema }) {
  const rows = [];
  console.log(schema);

  function recurse(obj, parent = '') {
    Object.keys(obj.properties).map(prop => {
      if (obj.properties[prop].properties) {
        return recurse(obj.properties[prop], prop);
      } else if (obj.properties[prop].type === 'array' && obj.properties[prop].items.properties) {
        return recurse(obj.properties[prop].items, prop);
      }
      const objName = parent ? `${parent}.${prop}` : prop;
      rows.push(
        <tr>
          <th>{objName}</th>
          <td>
            {obj.properties[prop].type}
            {obj.properties[prop].description && marked(obj.properties[prop].description)}
          </td>
        </tr>,
      );
    });
    return rows;
  }

  recurse(schema);
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
