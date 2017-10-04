const React = require('react');

function CustomFieldTemplate(props) {
  const {
    id,
    classNames,
    label,
    help,
    required,
    description,
    errors,
    children,
    schema,
    parent,
  } = props;

  if (id === 'root') {
    return children;
  }

  const isObject = children.type.name === 'CustomObjectField';
  const combinedLabel = [props.labelPrefix, label].filter(Boolean).join('.');

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

module.exports = CustomFieldTemplate;
