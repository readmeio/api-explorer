/* eslint-disable react/no-find-dom-node */
/* Utils for tests. */

import React from 'react';
import { renderIntoDocument, Simulate } from 'react-dom/test-utils';
import { findDOMNode, render } from 'react-dom';

import Form from '../src';

export function createComponent(Component, props) {
  const onChange = jest.fn();
  const onSubmit = jest.fn();
  const comp = renderIntoDocument(<Component onChange={onChange} onSubmit={onSubmit} {...props} />);
  const node = findDOMNode(comp);

  return { comp, node, onChange, onSubmit };
}

export function createFormComponent(props) {
  return createComponent(Form, { ...props });
}

export function setProps(comp, newProps) {
  const node = findDOMNode(comp);
  render(React.createElement(comp.constructor, newProps), node.parentNode);
}

export function submitForm(node) {
  Simulate.submit(node);
}
