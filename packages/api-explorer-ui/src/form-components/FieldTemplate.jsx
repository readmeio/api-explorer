const React = require('react');

function CustomFieldTemplate(props) {
  const { id, classNames, label, help, required, description, errors, children } = props;

  if (id === 'root') {
    return children;
  }

  // if (classNames === 'form-group field field-array') {
  //   return (
  //     <div className="param-item-info">
  //       {description}
  //       {children}
  //       {errors}
  //       {help}
  //     </div>
  //   );
  // }

  const isObject = children.type.name === 'CustomObjectField';

  return (
    <div>
      <div className="param-item">
        <div className="param-item-name">
          <strong htmlFor={id}>{label}</strong>
          <div className="param-type">type</div>
        </div>
        <div className="param-item-info">
          <div className="param-item-table">
            <div className="param-item-desc">{description}</div>
            <div className="param-item-input">{isObject ? String.fromCharCode(160) : children}</div>
            {errors}
            {help}
          </div>
        </div>
      </div>
      { isObject && children }
    </div>
  );
}

module.exports = CustomFieldTemplate;
