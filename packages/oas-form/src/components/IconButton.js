import React from 'react';

export default function IconButton(props) {
  const { type = 'default', icon, className, ...otherProps } = props;
  return (
    <button className={`btn btn-${type} ${className}`} type="button" {...otherProps}>
      <i className={`glyphicon glyphicon-${icon}`} />
    </button>
  );
}
