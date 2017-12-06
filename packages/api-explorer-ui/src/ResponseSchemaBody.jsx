const React = require('react');
const PropTypes = require('prop-types');
const marked = require('./lib/markdown/index');

function flattenResponseSchema(obj, parent = '') {
  return Object.keys(obj.properties)
    .map(prop => {
      // flattenResponseSchemas through if key's value is an object
      if (obj.properties[prop].properties) {
        // if (obj.properties[prop].type === 'object') {
        //   return [
        //     {
        //       name: prop,
        //       type: obj.properties[prop].type,
        //       description:
        //         obj.properties[prop].description && marked(obj.properties[prop].description),
        //     },
        //   ];
        // }
        return flattenResponseSchema(obj.properties[prop], prop);
      } else if (obj.properties[prop].type === 'array') {
        if (obj.properties[prop].items.properties) {
          // flattenResponseSchemas through key's value type is an array
          return flattenResponseSchema(obj.properties[prop].items, prop);
        }
        // array of primitive values
        return [
          {
            name: parent ? `${parent}.${prop}` : prop,
            type: `${obj.properties[prop].type} of ${obj.properties[prop].items.type}`,
            description:
              obj.properties[prop].description && marked(obj.properties[prop].description),
          },
        ];
      }
      // once flattened grab data
      return [
        {
          name: parent ? `${parent}.${prop}` : prop,
          type: obj.properties[prop].type,
          description: obj.properties[prop].description && marked(obj.properties[prop].description),
        },
      ];
    })
    .reduce((a, b) => a.concat(b));
}

function ResponseSchemaBody({ schema }) {
  console.log(schema);
  const rows = flattenResponseSchema(schema).map(row => (
    <tr key={row.name}>
      <th>{row.name}</th>
      <td>
        {row.type}
        <span
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: row.description }}
        />
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

module.exports.flattenResponseSchema = flattenResponseSchema;
