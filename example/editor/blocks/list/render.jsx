/* eslint-disable */
import React from 'react';
import repair from 'lodash/fromPairs'

export default ({attributes, children, node}) => {
  const {ordered} = repair([...node.data])
  const Tag = ordered ? 'ol' : 'ul';
  return (<Tag {...attributes}>{children}</Tag>);
}
