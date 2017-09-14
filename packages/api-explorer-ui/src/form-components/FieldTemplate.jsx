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

  return (
    <span>
      <div className="param-item-name">
        <strong htmlFor={id}>{label}</strong>
        <div className="param-type">type</div>
      </div>
      <div className="param-item-info">
        {description}
        {children}
        {errors}
        {help}
      </div>
    </span>
  );
}

module.exports = CustomFieldTemplate;
