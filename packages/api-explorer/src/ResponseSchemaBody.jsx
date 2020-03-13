const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('@readme/markdown').default;
const markdownMagic = require('@readme/markdown-magic');
const { flattenArray, flattenSchema } = require('@readme/oas-tooling/utils');

function getSchemaType(schema) {
  if (schema.type !== 'array') {
    return schema.type;
  }
  if (schema.items.$ref) {
    return 'array of objects';
  }
  return `array of ${schema.items.type}s`;
}

function getDescriptionMarkdown(useNewMarkdownEngine, description) {
  if (useNewMarkdownEngine) {
    return markdown(description);
  }

  return markdownMagic(description);
}

function ResponseSchemaBody({ schema, oas, useNewMarkdownEngine }) {
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
          wordBreak: 'break-word',
        }}
      >
        {row.name}
        {row.description && getDescriptionMarkdown(useNewMarkdownEngine, row.description)}
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
  useNewMarkdownEngine: PropTypes.bool,
};

ResponseSchemaBody.defaultProps = {
  useNewMarkdownEngine: false,
};

module.exports = ResponseSchemaBody;
