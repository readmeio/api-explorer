// Modified version of https://github.com/mozilla-services/react-jsonschema-form/blob/aadbbe9701c4db9df761e86f0280e1ecafc509f8/src/components/fields/DescriptionField.js
const React = require('react');
const PropTypes = require('prop-types');

const markdown = require('../lib/markdown');

function DescriptionField(props) {
  const { id, description } = props;

  if (!description) return null;

  if (typeof description === 'string') {
    return (
      <p
        id={id}
        className="field-description"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: markdown(description) }}
      />
    );
  }

  return (
    <div id={id} className="field-description">
      {description}
    </div>
  );
}

DescriptionField.propTypes = {
  id: PropTypes.string,
  description: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};

DescriptionField.defaultProps = {
  id: '',
  description: '',
};

module.exports = DescriptionField;
