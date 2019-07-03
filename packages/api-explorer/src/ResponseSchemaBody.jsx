import JsonViewer from './components/JsonViewer';

const React = require('react');
const PropTypes = require('prop-types');

function ResponseSchemaBody({ schema}) {
  return (
    <JsonViewer schema={schema} missingMessage={'schemaTabs.missing.response'} />
  );
}

module.exports = ResponseSchemaBody;

ResponseSchemaBody.propTypes = {
  schema: PropTypes.object.isRequired,
};
