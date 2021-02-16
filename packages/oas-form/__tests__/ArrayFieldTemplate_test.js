/* eslint-disable max-classes-per-file */
import React, { PureComponent } from 'react';
import { Simulate } from 'react-dom/test-utils';
import { createFormComponent } from './test_utils';

describe('ArrayFieldTemplate', () => {
  const formData = ['one', 'two', 'three'];

  describe('Custom ArrayFieldTemplate of string array', () => {
    function ArrayFieldTemplate(props) {
      return (
        <div className={props.uiSchema.classNames}>
          {props.canAdd && <button className="custom-array-add" />}
          {props.items.map(element => {
            return (
              <div key={element.index} className="custom-array-item">
                {element.children}
              </div>
            );
          })}
        </div>
      );
    }

    describe('Stateful ArrayFieldTemplate', () => {
      class ArrayFieldTemplate extends PureComponent {
        render() {
          return (
            <div className="field-content">
              {this.props.items.map((item, i) => (
                <div key={i}>item.children</div>
              ))}
            </div>
          );
        }
      }

      describe('with template globally configured', () => {
        it('should render a stateful custom component', () => {
          const { node } = createFormComponent({
            schema: { type: 'array', items: { type: 'string' } },
            formData,
            ArrayFieldTemplate,
          });

          expect(node.querySelectorAll('.field-array .field-content div')).toHaveLength(3);
        });
      });

      describe('with template configured in ui:ArrayFieldTemplate', () => {
        it('should render a stateful custom component', () => {
          const { node } = createFormComponent({
            schema: { type: 'array', items: { type: 'string' } },
            formData,
            uiSchema: {
              'ui:ArrayFieldTemplate': ArrayFieldTemplate,
            },
          });

          expect(node.querySelectorAll('.field-array .field-content div')).toHaveLength(3);
        });
      });

      describe('with template configured globally being overriden in ui:ArrayFieldTemplate', () => {
        it('should render a stateful custom component', () => {
          const { node } = createFormComponent({
            schema: { type: 'array', items: { type: 'string' } },
            formData,
            uiSchema: {
              'ui:ArrayFieldTemplate': ArrayFieldTemplate,
            },
            // Empty field template for proof that we're doing overrides
            ArrayFieldTemplate: () => <div />,
          });

          expect(node.querySelectorAll('.field-array .field-content div')).toHaveLength(3);
        });
      });
    });

    describe('not fixed items', () => {
      const schema = {
        type: 'array',
        title: 'my list',
        description: 'my description',
        items: { type: 'string' },
      };

      let node;

      describe('with template globally configured', () => {
        const uiSchema = {
          classNames: 'custom-array',
        };

        beforeEach(() => {
          node = createFormComponent({
            ArrayFieldTemplate,
            formData,
            schema,
            uiSchema,
          }).node;
        });

        sharedIts();
      });

      describe('with template configured in ui:ArrayFieldTemplate', () => {
        const uiSchema = {
          classNames: 'custom-array',
          'ui:ArrayFieldTemplate': ArrayFieldTemplate,
        };

        beforeEach(() => {
          node = createFormComponent({
            formData,
            schema,
            uiSchema,
          }).node;
        });

        sharedIts();
      });

      describe('with template configured globally being overriden in ui:ArrayFieldTemplate', () => {
        const uiSchema = {
          classNames: 'custom-array',
          'ui:ArrayFieldTemplate': ArrayFieldTemplate,
        };

        beforeEach(() => {
          node = createFormComponent({
            formData,
            schema,
            uiSchema,
            // Empty field template for proof that we're doing overrides
            ArrayFieldTemplate: () => <div />,
          }).node;
        });

        sharedIts();
      });

      function sharedIts() {
        it('should render one root element for the array', () => {
          expect(node.querySelectorAll('.custom-array')).toHaveLength(1);
        });

        it('should render one add button', () => {
          expect(node.querySelectorAll('.custom-array-add')).toHaveLength(1);
        });

        it('should render one child for each array item', () => {
          expect(node.querySelectorAll('.custom-array-item')).toHaveLength(formData.length);
        });

        it('should render text input for each array item', () => {
          expect(node.querySelectorAll('.custom-array-item .field input[type=text]')).toHaveLength(formData.length);
        });
      }
    });

    describe('fixed items', () => {
      const schema = {
        type: 'array',
        title: 'my list',
        description: 'my description',
        items: [{ type: 'string' }, { type: 'string' }, { type: 'string' }],
      };

      let node;

      describe('with template globally configured', () => {
        const uiSchema = {
          classNames: 'custom-array',
        };

        beforeEach(() => {
          node = createFormComponent({
            formData,
            schema,
            uiSchema,
            ArrayFieldTemplate,
          }).node;
        });

        sharedIts();
      });

      describe('with template configured in ui:ArrayFieldTemplate', () => {
        const uiSchema = {
          classNames: 'custom-array',
          'ui:ArrayFieldTemplate': ArrayFieldTemplate,
        };

        beforeEach(() => {
          node = createFormComponent({
            formData,
            schema,
            uiSchema,
          }).node;
        });

        sharedIts();
      });

      describe('with template configured globally being overriden in ui:ArrayFieldTemplate', () => {
        const uiSchema = {
          classNames: 'custom-array',
          'ui:ArrayFieldTemplate': ArrayFieldTemplate,
        };

        beforeEach(() => {
          node = createFormComponent({
            formData,
            schema,
            uiSchema,
            // Empty field template for proof that we're doing overrides
            ArrayFieldTemplate: () => <div />,
          }).node;
        });

        sharedIts();
      });

      function sharedIts() {
        it('should render one root element for the array', () => {
          expect(node.querySelectorAll('.custom-array')).toHaveLength(1);
        });

        it('should not render an add button', () => {
          expect(node.querySelectorAll('.custom-array-add')).toHaveLength(0);
        });

        it('should render one child for each array item', () => {
          expect(node.querySelectorAll('.custom-array-item')).toHaveLength(formData.length);
        });

        it('should render text input for each array item', () => {
          expect(node.querySelectorAll('.custom-array-item .field input[type=text]')).toHaveLength(formData.length);
        });
      }
    });
  });

  describe('Stateful ArrayFieldTemplate', () => {
    class ArrayFieldTemplate extends PureComponent {
      render() {
        return (
          <div className="field-content">
            {this.props.items.map((item, i) => (
              <div key={i}>item.children</div>
            ))}
          </div>
        );
      }
    }

    it('should render a stateful custom component', () => {
      const { node } = createFormComponent({
        schema: { type: 'array', items: { type: 'string' } },
        formData,
        ArrayFieldTemplate,
      });
      expect(node.querySelectorAll('.field-array .field-content div')).toHaveLength(3);
    });
  });

  describe('pass right props to ArrayFieldTemplate', () => {
    it('should pass registry prop', () => {
      const ArrayFieldTemplate = ({ registry }) => {
        if (!registry) {
          throw new Error('Error');
        }
        return null;
      };
      expect(() => {
        createFormComponent({
          schema: { type: 'array', items: { type: 'string' } },
          formData,
          ArrayFieldTemplate,
        });
      }).not.toThrow('Error');
    });

    it('should pass formData so it is in sync with items', () => {
      const ArrayFieldTemplate = ({ formData, items, onAddClick }) => {
        if (formData.length !== items.length) {
          throw new Error('Error');
        }
        return (
          <div>
            {items.map((item, i) => (
              <span key={i}>value: {formData[i]}</span>
            ))}
            <button className="array-item-add" onClick={onAddClick} />
          </div>
        );
      };
      const { node } = createFormComponent({
        schema: { type: 'array', items: { type: 'string' } },
        formData,
        ArrayFieldTemplate,
      });
      expect(() => {
        Simulate.click(node.querySelector('.array-item-add'));
      }).not.toThrow('Error');
    });
  });
});
