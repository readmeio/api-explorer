import React from 'react';

export default function IconButton(props) {
  // eslint-disable-next-line react/prop-types
  const { type = 'default', icon, className, ...otherProps } = props;
  return (
    <button className={`btn btn-${type} ${className}`} type="button" {...otherProps}>
      <i className={`glyphicon glyphicon-${icon}`} />
    </button>
  );
}
