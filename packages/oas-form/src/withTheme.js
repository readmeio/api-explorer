import React, { forwardRef } from 'react';
import PropTypes from 'prop-types';
import Form from '.';

function withTheme(themeProps) {
  // eslint-disable-next-line react/prop-types
  return forwardRef(({ fields, widgets, ...directProps }, ref) => {
    fields = { ...themeProps.fields, ...fields };
    widgets = { ...themeProps.widgets, ...widgets };

    return <Form {...themeProps} {...directProps} ref={ref} fields={fields} widgets={widgets} />;
  });
}

withTheme.propTypes = {
  fields: PropTypes.object,
  widgets: PropTypes.object,
};

export default withTheme;
