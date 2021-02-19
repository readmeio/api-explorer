import PropTypes from 'prop-types';

export const registry = PropTypes.shape({
  ArrayFieldTemplate: PropTypes.elementType,
  definitions: PropTypes.object.isRequired,
  fields: PropTypes.objectOf(PropTypes.elementType).isRequired,
  FieldTemplate: PropTypes.elementType,
  formContext: PropTypes.object.isRequired,
  ObjectFieldTemplate: PropTypes.elementType,
  rootSchema: PropTypes.object,
  widgets: PropTypes.objectOf(PropTypes.oneOfType([PropTypes.func, PropTypes.object])).isRequired,
});

export const fieldProps = {
  autofocus: PropTypes.bool,
  disabled: PropTypes.bool,
  formData: PropTypes.any,
  idSchema: PropTypes.object,
  onBlur: PropTypes.func,
  onChange: PropTypes.func.isRequired,
  onFocus: PropTypes.func,
  readonly: PropTypes.bool,
  registry: registry.isRequired,
  required: PropTypes.bool,
  schema: PropTypes.object.isRequired,
  uiSchema: PropTypes.shape({
    'ui:options': PropTypes.shape({
      addable: PropTypes.bool,
      removable: PropTypes.bool,
    }),
  }),
};
