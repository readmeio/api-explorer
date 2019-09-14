/* eslint-disable */
import React from 'react';

const handleClicks = (kid) => {
  const tabsWrap = document.querySelectorAll('.tabs_initialState')[0];
  if (tabsWrap) tabsWrap.classList.remove('tabs_initialState');
  document.querySelectorAll('.tab_active').forEach(el => el.classList.remove('tab_active'));
  document.querySelectorAll(`[data-key="${kid.key}"]`)[0].classList.add('tab_active');
};

export default function RdmeWrap(props) {
  const { attributes, children, node } = props;
  return (
    <div className={`tabs_initialState ${node.data.get('className')}`} {...attributes}>
      {children.map(kid => (
        <button key={`tab-toggle-${kid.key}`} onClick={() => handleClicks(kid)}>
          { kid.props.node.get('data').get('meta') || `(${kid.props.node.get('data').get('lang')})` }
        </button>
      ))}
      {children}
    </div>
  );
}