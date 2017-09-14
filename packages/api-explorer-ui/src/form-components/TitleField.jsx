// https://github.com/mozilla-services/react-jsonschema-form/blob/03b54d086036167d5e1aa970c9d4d103dd766617/src/components/fields/TitleField.js
const React = require('react');
const PropTypes = require('prop-types');

function TitleField(props) {
  return <div className="param-item-name"><strong>{props.title}</strong></div>;
}

TitleField.propTypes = {
  title: PropTypes.string,
};

TitleField.defaultProps = {
  title: '',
};

module.exports = TitleField;
