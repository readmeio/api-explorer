// Modified version of https://github.com/mozilla-services/react-jsonschema-form/blob/aadbbe9701c4db9df761e86f0280e1ecafc509f8/src/components/fields/DescriptionField.js
const React = require('react');
const PropTypes = require('prop-types');

const markdown = require('@readme/markdown').default;

function DescriptionField(props) {
  const { id, description } = props;
  if (!description) return null;

  return (
    <div className="field-description" id={id}>
      {typeof description === 'string' ? markdown(description) : description}
    </div>
  );
}

DescriptionField.propTypes = {
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  id: PropTypes.string,
};

DescriptionField.defaultProps = {
  description: '',
  id: '',
};

module.exports = DescriptionField;
