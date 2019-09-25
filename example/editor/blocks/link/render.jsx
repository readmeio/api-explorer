/* eslint-disable */
import React from 'react';

export default ({ attributes, children, node }) => (
  <a {...attributes} href={node.data.get('href')}>
    {children}
  </a>
);