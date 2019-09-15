/* eslint-disable */
import React from 'react';

const repair = pairs => require('lodash/fromPairs')([...pairs])

export default ({attributes, children, node}) => {
  // console.log({attributes, node})
  return (
    <li {...attributes} className={node.data.size>0 ? 'task-list-item' : ''}>
      {node.data.size>0 && <input
        type="checkbox"
        defaultChecked={node.data.get('checked')}
        onChange={e => changed(e, node)}
        />}
      {children}
    </li>
  );
};

function changed(e, node) {
  node.data.set('checked', `${e.target.checked}`);
}