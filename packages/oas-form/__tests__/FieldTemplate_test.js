import React from 'react';

import { createFormComponent } from './test_utils';

describe('FieldTemplate', () => {
  describe('Custom FieldTemplate for disabled property', () => {
    function FieldTemplate(props) {
      return <div className={props.disabled ? 'disabled' : 'foo'} />;
    }

    describe('with template globally configured', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { node } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true },
          FieldTemplate,
        });
        expect(node.querySelectorAll('.disabled')).toHaveLength(1);
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { node } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false },
          FieldTemplate,
        });
        expect(node.querySelectorAll('.disabled')).toHaveLength(0);
      });
    });

    describe('with template configured in ui:FieldTemplate', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { node } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true, 'ui:FieldTemplate': FieldTemplate },
        });
        expect(node.querySelectorAll('.disabled')).toHaveLength(1);
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { node } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false, 'ui:FieldTemplate': FieldTemplate },
        });
        expect(node.querySelectorAll('.disabled')).toHaveLength(0);
      });
    });

    describe('with template configured globally being overriden in ui:FieldTemplate', () => {
      it('should render with disabled when ui:disabled is truthy', () => {
        const { node } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': true, 'ui:FieldTemplate': FieldTemplate },
          // Empty field template to prove that overides work
          FieldTemplate: () => <div />,
        });
        expect(node.querySelectorAll('.disabled')).toHaveLength(1);
      });

      it('should render with disabled when ui:disabled is falsey', () => {
        const { node } = createFormComponent({
          schema: { type: 'string' },
          uiSchema: { 'ui:disabled': false, 'ui:FieldTemplate': FieldTemplate },
          // Empty field template to prove that overides work
          FieldTemplate: () => <div />,
        });
        expect(node.querySelectorAll('.disabled')).toHaveLength(0);
      });
    });
  });
});
