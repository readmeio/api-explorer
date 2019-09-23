/* eslint-disable */
import React from 'react';

export default ({attributes, children, node}) => (
  <table {...attributes}>
    <tbody>{children}</tbody>
  </table>
);
