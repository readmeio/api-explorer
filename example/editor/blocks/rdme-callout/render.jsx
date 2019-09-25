/* eslint-disable */
import React from 'react';
import './style.scss';

export default props => {
  const {attributes, children, node} = props;
  const {theme} = node && node.data.toJSON() || props || {};
    //^This is to deal with different^
    // methods of passing props btwn
    // the hast-util's hProps and our 
    // slate-mdast-serializer.
  return (
    <blockquote {...attributes} className={`callout callout_${theme}`}>
      {children}
    </blockquote>
  );
};