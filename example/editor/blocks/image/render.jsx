/* eslint-disable */
import React from 'react';

export default function Image({node, attributes, children, isFocused}) {
  const [
    title,
    align,
    width='auto',
    height='auto'
  ] = node.data.get('title') ? node.data.get('title').split(', ') : [];

  return (<img
    src={node.data.get('src')}
    title={title}
    align={align}
    width={width}
    height={height}
    alt={node.data.get('alt')}
    style={{
      boxShadow: isFocused ? '0 0 0 2px white, 0 0 0 4px dodgerblue' : 'none',
    }}
    {...attributes}
  />);
}