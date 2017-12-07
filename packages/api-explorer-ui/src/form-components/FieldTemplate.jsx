const React = require('react');
const PropTypes = require('prop-types');
const CustomObjectField = require('./ObjectField');

function CustomFieldTemplate(props) {
  const { id, label, help, required, description, errors, children, schema, labelPrefix } = props;

  if (id === 'root') {
    return children;
  }

  const isObject = children.type.name === CustomObjectField.name;
  const combinedLabel = [labelPrefix, label].filter(Boolean).join('.');

  return (
    <div>
      <div className="param-item">
        <div className="param-item-name">
          <strong htmlFor={id}>{combinedLabel}</strong>
          <div className="param-type">{schema.type}</div>
        </div>
        <div className="param-item-info">
          <div className="param-item-table">
            <div className="param-item-desc">
              {required && <div className="param-item-required">required</div>}
              {description}
            </div>
            <div className="param-item-input">{isObject ? String.fromCharCode(160) : children}</div>
            {errors}
            {help}
          </div>
        </div>
      </div>
      {isObject &&
        React.Children.map(children, child =>
          React.cloneElement(child, { labelPrefix: combinedLabel }),
        )}
    </div>
  );
}

CustomFieldTemplate.propTypes = {
  id: PropTypes.string.isRequired,
  label: PropTypes.string,
  children: PropTypes.node.isRequired,
  errors: PropTypes.element.isRequired,
  help: PropTypes.element.isRequired,
  description: PropTypes.element.isRequired,
  required: PropTypes.bool.isRequired,
  schema: PropTypes.shape({ type: PropTypes.string }).isRequired,
  labelPrefix: PropTypes.string.isRequired,
};

CustomFieldTemplate.defaultProps = {
  label: '',
  labelPrefix: '',
  required: false,
};

module.exports = CustomFieldTemplate;
