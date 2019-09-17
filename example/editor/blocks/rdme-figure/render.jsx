/* eslint-disable */
import React from 'react';

export default function RdmeWrap(props) {
  const { attributes, children, node } = props;
  return (
    <figure {...attributes} className={node.data.get('className')}>
      {children}
    </figure>
  );
}