import React from 'react';
import PropTypes from 'prop-types';

function DescriptionField(props) {
  const { id, description } = props;
  if (!description) {
    return null;
  }
  if (typeof description === 'string') {
    return (
      <p className="field-description" id={id}>
        {description}
      </p>
    );
  }

  return (
    <div className="field-description" id={id}>
      {description}
    </div>
  );
}

if (process.env.NODE_ENV !== 'production') {
  DescriptionField.propTypes = {
    description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    id: PropTypes.string,
  };
}

export default DescriptionField;
