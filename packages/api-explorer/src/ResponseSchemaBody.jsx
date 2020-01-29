const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('@readme/markdown').default;
const { flattenArray, flattenSchema } = require('oas/utils');

function getSchemaType(schema) {
  if (schema.type !== 'array') {
    return schema.type;
  }
  if (schema.items.$ref) {
    return 'array of objects';
  }
  return `array of ${schema.items.type}s`;
}

function ResponseSchemaBody({ schema, oas }) {
  const rows = flattenArray(flattenSchema(schema, oas)).map(row => (
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

ResponseSchemaBody.propTypes = {
  oas: PropTypes.shape({}).isRequired,
  schema: PropTypes.shape({
    items: PropTypes.object,
    properties: PropTypes.object,
    type: PropTypes.string.isRequired,
  }).isRequired,
};

module.exports = ResponseSchemaBody;
