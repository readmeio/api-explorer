import colors from '../../colors'

const React = require('react');
const IconStatus = require('../../IconStatus');
const PropTypes = require('prop-types');


function Meta({ label, children }) {
  const style = {
    label: {
      textTransform: 'uppercase',
      fontSize: 11,
      marginBottom: 3,
      color: colors.metadataLabel
    },
    content: {
      margin: '0px 10px',
      padding: 0,
      fontSize: 11,
      fontFamily: 'monospace',
      color: colors.metadataContent
    },
    container: {
      display: 'grid', 
      gridTemplateColumns: '1fr', 
      gridTemplateRows: 'auto 1fr',
      padding: 5
    }
  }
  return (
    <div style={style.container}>
      {
        // eslint-disable-next-line jsx-a11y/label-has-for
        <label style={style.label}>{label}</label>
      }
      <div style={style.content}>
        {children}
      </div>
    </div>
  );
}

Meta.propTypes = {
  label: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
};

function ResponseMetadata({ result }) {
  return (
    <div style={{ display: 'block' }}>
      <Meta label="Method">
        {result.method.toString()}
      </Meta>

      <Meta label="URL">
        {result.url}
      </Meta>

      <Meta label="Request Headers">
        {result.requestHeaders.join('\n')}
      </Meta>

      <Meta label="Request Data">
        {result.requestBody}
      </Meta>

      <Meta label="Status">
        <span className="httpstatus">
          <IconStatus status={result.status} />
        </span>
      </Meta>

      <Meta label="Response Headers">
        {result.responseHeaders.join('\n')}
      </Meta>
    </div>
  );
}

module.exports = ResponseMetadata;

ResponseMetadata.propTypes = {
  result: PropTypes.shape({}).isRequired,
};
