/* eslint-disable */
import React from 'react';

export default ({ attributes, children, node }) => {
  const Tag = node.type;
  return <Tag {...attributes}>{children}</Tag>;
};