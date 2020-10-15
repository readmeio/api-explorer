import React from 'react';
import PropTypes from 'prop-types';

function UnsupportedField({ schema, idSchema, reason }) {
  return (
    <div className="unsupported-field">
      <p>
        Unsupported field schema
        {idSchema && idSchema.$id && (
          <span>
            {' for'} field <code>{idSchema.$id}</code>
          </span>
        )}
        {reason && <em>: {reason}</em>}.
      </p>
      {schema && <pre>{JSON.stringify(schema, null, 2)}</pre>}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  UnsupportedField.propTypes = {
    idSchema: PropTypes.object,
    reason: PropTypes.string,
    schema: PropTypes.object.isRequired,
  };
}

export default UnsupportedField;
