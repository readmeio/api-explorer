// Modified version of https://github.com/mozilla-services/react-jsonschema-form/blob/2d390f6e56d5c54e715c5daa8b0610be5c62e91e/src/components/fields/DescriptionField.js
const React = require('react');
const PropTypes = require('prop-types');

const markdown = require('../lib/markdown');

function DescriptionField(props) {
  const { id, description } = props;
  if (!description) {
    // See #312: Ensure compatibility with old versions of React.
    return null;
  }
  if (typeof description === 'string') {
    return (
      <p id={id} className="field-description" dangerouslySetInnerHTML={{__html: markdown(description)}} />
    );
  } else {
    return (
      <div id={id} className="field-description">
        {description}
      </div>
    );
  }
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
