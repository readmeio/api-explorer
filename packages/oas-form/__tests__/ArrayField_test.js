import React from 'react';

import { Simulate } from 'react-dom/test-utils';

import { createFormComponent } from './test_utils';

const ArrayKeyDataAttr = 'data-rjsf-itemkey';
const ExposedArrayKeyTemplate = function (props) {
  return (
    <div className="array">
      {props.items &&
        props.items.map(element => (
          <div key={element.key} className="array-item" data-rjsf-itemkey={element.key}>
            <div>{element.children}</div>
            {element.hasRemove && (
              <button className="array-item-remove" onClick={element.onDropIndexClick(element.index)}>
                Remove
              </button>
            )}
            <button onClick={element.onDropIndexClick(element.index)}>Delete</button>
            <hr />
          </div>
        ))}

      {props.canAdd && (
        <div className="array-item-add">
          <button onClick={props.onAddClick} type="button">
            Add New
          </button>
        </div>
      )}
    </div>
  );
};

describe('ArrayField', () => {
  const CustomComponent = () => {
    return <div id="custom" />;
  };

  describe('Unsupported array schema', () => {
    it('should warn on missing items descriptor', () => {
      const { node } = createFormComponent({ schema: { type: 'array' } });

      expect(node.querySelector('.field-array > .unsupported-field')).toHaveTextContent('Missing items definition');
    });

    it('should be able to be overwritten with a custom UnsupportedField component', () => {
      const CustomUnsupportedField = function () {
        return <span id="custom">Custom UnsupportedField</span>;
      };

      const fields = { UnsupportedField: CustomUnsupportedField };
      const { node } = createFormComponent({
        schema: { type: 'array' },
        fields,
      });

      expect(node.querySelectorAll('#custom')[0]).toHaveTextContent('Custom UnsupportedField');
    });
  });

  describe('List of inputs', () => {
    const schema = {
      type: 'array',
      title: 'my list',
      description: 'my description',
      items: { type: 'string' },
    };

    it('should render a fieldset', () => {
      const { node } = createFormComponent({ schema });

      const fieldset = node.querySelectorAll('fieldset');
      expect(fieldset).toHaveLength(1);
      expect(fieldset[0].id).toBe('root');
    });

    it('should render a fieldset legend', () => {
      const { node } = createFormComponent({ schema });

      const legend = node.querySelector('fieldset > legend');

      expect(legend).toHaveTextContent('my list');
      expect(legend.id).toBe('root__title');
    });

    it('should render a description', () => {
      const { node } = createFormComponent({ schema });

      const description = node.querySelector('fieldset > .field-description');

      expect(description).toHaveTextContent('my description');
      expect(description.id).toBe('root__description');
    });

    it('should render a hidden list', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:widget': 'hidden',
        },
      });
      expect(node.querySelector('div.hidden > fieldset')).not.toBeNull();
    });

    it('should render a customized title', () => {
      const CustomTitleField = ({ title }) => <div id="custom">{title}</div>;

      const { node } = createFormComponent({
        schema,
        fields: { TitleField: CustomTitleField },
      });
      expect(node.querySelector('fieldset > #custom')).toHaveTextContent('my list');
    });

    it('should render a customized description', () => {
      const CustomDescriptionField = ({ description }) => <div id="custom">{description}</div>;

      const { node } = createFormComponent({
        schema,
        fields: {
          DescriptionField: CustomDescriptionField,
        },
      });
      expect(node.querySelector('fieldset > #custom')).toHaveTextContent('my description');
    });

    it('should render a customized file widget', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: {
          'ui:widget': 'files',
        },
        widgets: { FileWidget: CustomComponent },
      });
      expect(node.querySelector('#custom')).not.toBeNull();
    });

    it('should contain no field in the list by default', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('.field-string')).toHaveLength(0);
    });

    it('should have an add button', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.array-item-add button')).not.toBeNull();
    });

    it('should not have an add button if addable is false', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: { 'ui:options': { addable: false } },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('should add a new field when clicking the add button', () => {
      const { node } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelectorAll('.field-string')).toHaveLength(1);
    });

    it('should add a new field when clicking the add button and the array has an empty `items` declaration', () => {
      const { node } = createFormComponent({
        schema: {
          type: 'array',
          title: 'my list',
          description: 'my description',
          items: {},
        },
      });

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelectorAll('.field-string')).toHaveLength(1);
    });

    it('should assign new keys/ids when clicking the add button', () => {
      const { node } = createFormComponent({
        schema,
        ArrayFieldTemplate: ExposedArrayKeyTemplate,
      });

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelector('.array-item')).toHaveAttribute(ArrayKeyDataAttr);
    });

    it('should not provide an add button if length equals maxItems', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        formData: ['foo', 'bar'],
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('should provide an add button if length is lesser than maxItems', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        formData: ['foo'],
      });

      expect(node.querySelector('.array-item-add button')).not.toBeNull();
    });

    it('should retain existing row keys/ids when adding new row', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        formData: ['foo'],
        ArrayFieldTemplate: ExposedArrayKeyTemplate,
      });

      const startRows = node.querySelectorAll('.array-item');
      const startRow1_key = startRows[0].getAttribute(ArrayKeyDataAttr);
      const startRow2_key = startRows[1] ? startRows[1].getAttribute(ArrayKeyDataAttr) : undefined;

      Simulate.click(node.querySelector('.array-item-add button'));

      const endRows = node.querySelectorAll('.array-item');
      const endRow1_key = endRows[0].getAttribute(ArrayKeyDataAttr);
      const endRow2_key = endRows[1].getAttribute(ArrayKeyDataAttr);

      expect(startRow1_key).toBe(endRow1_key);
      expect(startRow2_key).not.toBe(endRow2_key);

      expect(startRow2_key).toBeUndefined();
      expect(endRows[0]).toHaveAttribute(ArrayKeyDataAttr);
      expect(endRows[1]).toHaveAttribute(ArrayKeyDataAttr);
    });

    it('should allow inserting anywhere in list', () => {
      function addItemAboveOrBelow(item) {
        const beforeIndex = item.index;
        const addBeforeButton = (
          <button
            key={`array-item-add-before-${item.key}`}
            className={`array-item-move-before array-item-move-before-to-${beforeIndex}`}
            onClick={item.onAddIndexClick(beforeIndex)}
          >
            {'Add Item Above'}
          </button>
        );

        const afterIndex = item.index + 1;
        const addAfterButton = (
          <button
            key={`array-item-add-after-${item.key}`}
            className={`array-item-move-after array-item-move-after-to-${afterIndex}`}
            onClick={item.onAddIndexClick(afterIndex)}
          >
            {'Add Item Below'}
          </button>
        );

        return (
          <div key={item.key} className={`array-item item-${item.index}`} data-rjsf-itemkey={item.key}>
            <div>{addBeforeButton}</div>
            {item.children}
            <div>{addAfterButton}</div>
            <hr />
          </div>
        );
      }

      function addAboveOrBelowArrayFieldTemplate(props) {
        return <div className="array">{props.items.map(addItemAboveOrBelow)}</div>;
      }

      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar', 'baz'],
        ArrayFieldTemplate: addAboveOrBelowArrayFieldTemplate,
      });

      const addBeforeButtons = node.querySelectorAll('.array-item-move-before');
      const addAfterButtons = node.querySelectorAll('.array-item-move-after');

      const startRows = node.querySelectorAll('.array-item');
      const startRow1_key = startRows[0].getAttribute(ArrayKeyDataAttr);
      const startRow2_key = startRows[1].getAttribute(ArrayKeyDataAttr);
      const startRow3_key = startRows[2].getAttribute(ArrayKeyDataAttr);

      Simulate.click(addBeforeButtons[0]);
      Simulate.click(addAfterButtons[0]);

      const endRows = node.querySelectorAll('.array-item');
      const endRow2_key = endRows[1].getAttribute(ArrayKeyDataAttr);
      const endRow4_key = endRows[3].getAttribute(ArrayKeyDataAttr);
      const endRow5_key = endRows[4].getAttribute(ArrayKeyDataAttr);

      expect(startRow1_key).toBe(endRow2_key);
      expect(startRow2_key).toBe(endRow4_key);
      expect(startRow3_key).toBe(endRow5_key);

      expect(endRows[0]).toHaveAttribute(ArrayKeyDataAttr);
      expect(endRows[1]).toHaveAttribute(ArrayKeyDataAttr);
      expect(endRows[2]).toHaveAttribute(ArrayKeyDataAttr);
      expect(endRows[3]).toHaveAttribute(ArrayKeyDataAttr);
      expect(endRows[4]).toHaveAttribute(ArrayKeyDataAttr);
    });

    it('should not provide an add button if addable is expliclty false regardless maxItems value', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        formData: ['foo'],
        uiSchema: {
          'ui:options': {
            addable: false,
          },
        },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('should ignore addable value if maxItems constraint is not satisfied', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        formData: ['foo', 'bar'],
        uiSchema: {
          'ui:options': {
            addable: true,
          },
        },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('should mark a non-null array item widget as required', () => {
      const { node } = createFormComponent({ schema });

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelector('.field-string input[type=text]')).toBeRequired();
    });

    it('should fill an array field with data', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar'],
      });
      const inputs = node.querySelectorAll('.field-string input[type=text]');

      expect(inputs).toHaveLength(2);
      expect(inputs[0].value).toBe('foo');
      expect(inputs[1].value).toBe('bar');
    });

    it('should remove a field from the list', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar'],
      });
      const dropBtns = node.querySelectorAll('.array-item-remove');

      Simulate.click(dropBtns[0]);

      const inputs = node.querySelectorAll('.field-string input[type=text]');
      expect(inputs).toHaveLength(1);
      expect(inputs[0].value).toBe('bar');
    });

    it('should delete item from list and correct indices', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar', 'baz'],
      });
      const deleteBtns = node.querySelectorAll('.array-item-remove');

      Simulate.click(deleteBtns[0]);

      const inputs = node.querySelectorAll('.field-string input[type=text]');

      Simulate.change(inputs[0], { target: { value: 'fuzz' } });
      expect(inputs).toHaveLength(2);
      expect(inputs[0].value).toBe('fuzz');
      expect(inputs[1].value).toBe('baz');
    });

    it('should retain row keys/ids of remaining rows when a row is removed', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar'],
        ArrayFieldTemplate: ExposedArrayKeyTemplate,
      });

      const startRows = node.querySelectorAll('.array-item');
      const startRow2_key = startRows[1].getAttribute(ArrayKeyDataAttr);

      const dropBtns = node.querySelectorAll('.array-item-remove');
      Simulate.click(dropBtns[0]);

      const endRows = node.querySelectorAll('.array-item');
      const endRow1_key = endRows[0].getAttribute(ArrayKeyDataAttr);

      expect(startRow2_key).toBe(endRow1_key);
      expect(endRows[0]).toHaveAttribute(ArrayKeyDataAttr);
    });

    it('should not show remove button if removable is false', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar'],
        uiSchema: { 'ui:options': { removable: false } },
      });
      const dropBtn = node.querySelector('.array-item-remove');

      expect(dropBtn).toBeNull();
    });

    it('should render the input widgets with the expected ids', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 'bar'],
      });

      const inputs = node.querySelectorAll('input[type=text]');
      expect(inputs[0].id).toBe('root_0');
      expect(inputs[1].id).toBe('root_1');
    });

    it('should render nested input widgets with the expected ids', () => {
      const complexSchema = {
        type: 'object',
        properties: {
          foo: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                bar: { type: 'string' },
                baz: { type: 'string' },
              },
            },
          },
        },
      };
      const { node } = createFormComponent({
        schema: complexSchema,
        formData: {
          foo: [
            { bar: 'bar1', baz: 'baz1' },
            { bar: 'bar2', baz: 'baz2' },
          ],
        },
      });

      const inputs = node.querySelectorAll('input[type=text]');
      expect(inputs[0].id).toBe('root_foo_0_bar');
      expect(inputs[1].id).toBe('root_foo_0_baz');
      expect(inputs[2].id).toBe('root_foo_1_bar');
      expect(inputs[3].id).toBe('root_foo_1_baz');
    });

    it('should render enough inputs with proper defaults to match minItems in schema when no formData is set', () => {
      const complexSchema = {
        type: 'object',
        definitions: {
          Thing: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                default: 'Default name',
              },
            },
          },
        },
        properties: {
          foo: {
            type: 'array',
            minItems: 2,
            items: {
              $ref: '#/definitions/Thing',
            },
          },
        },
      };
      const form = createFormComponent({
        schema: complexSchema,
        formData: {},
      });
      const inputs = form.node.querySelectorAll('input[type=text]');
      expect(inputs[0].value).toBe('Default name');
      expect(inputs[1].value).toBe('Default name');
    });

    it('should render an input for each default value, even when this is greater than minItems', () => {
      const schema = {
        type: 'object',
        properties: {
          turtles: {
            type: 'array',
            minItems: 2,
            default: ['Raphael', 'Michaelangelo', 'Donatello', 'Leonardo'],
            items: {
              type: 'string',
            },
          },
        },
      };
      const { node } = createFormComponent({ schema });
      const inputs = node.querySelectorAll('input[type=text]');
      expect(inputs).toHaveLength(4);
      expect(inputs[0].value).toBe('Raphael');
      expect(inputs[1].value).toBe('Michaelangelo');
      expect(inputs[2].value).toBe('Donatello');
      expect(inputs[3].value).toBe('Leonardo');
    });

    it('should render enough input to match minItems, populating the first with default values, and the rest empty', () => {
      const schema = {
        type: 'object',
        properties: {
          turtles: {
            type: 'array',
            minItems: 4,
            default: ['Raphael', 'Michaelangelo'],
            items: {
              type: 'string',
            },
          },
        },
      };
      const { node } = createFormComponent({ schema });
      const inputs = node.querySelectorAll('input[type=text]');
      expect(inputs).toHaveLength(4);
      expect(inputs[0].value).toBe('Raphael');
      expect(inputs[1].value).toBe('Michaelangelo');
      expect(inputs[2].value).toBe('');
      expect(inputs[3].value).toBe('');
    });

    it('should render enough input to match minItems, populating the first with default values, and the rest with the item default', () => {
      const schema = {
        type: 'object',
        properties: {
          turtles: {
            type: 'array',
            minItems: 4,
            default: ['Raphael', 'Michaelangelo'],
            items: {
              type: 'string',
              default: 'Unknown',
            },
          },
        },
      };
      const { node } = createFormComponent({ schema });
      const inputs = node.querySelectorAll('input[type=text]');
      expect(inputs).toHaveLength(4);
      expect(inputs[0].value).toBe('Raphael');
      expect(inputs[1].value).toBe('Michaelangelo');
      expect(inputs[2].value).toBe('Unknown');
      expect(inputs[3].value).toBe('Unknown');
    });

    it('should honor given formData, even when it does not meet ths minItems-requirement', () => {
      const complexSchema = {
        type: 'object',
        definitions: {
          Thing: {
            type: 'object',
            properties: {
              name: {
                type: 'string',
                default: 'Default name',
              },
            },
          },
        },
        properties: {
          foo: {
            type: 'array',
            minItems: 2,
            items: {
              $ref: '#/definitions/Thing',
            },
          },
        },
      };
      const form = createFormComponent({
        schema: complexSchema,
        formData: { foo: [] },
      });
      const inputs = form.node.querySelectorAll('input[type=text]');
      expect(inputs).toHaveLength(0);
    });
  });

  describe('Multiple choices list', () => {
    const schema = {
      type: 'array',
      title: 'My field',
      items: {
        enum: ['foo', 'bar', 'fuzz'],
        type: 'string',
      },
      uniqueItems: true,
    };

    describe('Select multiple widget', () => {
      it('should render a select widget', () => {
        const { node } = createFormComponent({ schema });

        expect(node.querySelectorAll('select')).toHaveLength(1);
      });

      it('should render a select widget with a label', () => {
        const { node } = createFormComponent({ schema });

        expect(node.querySelector('.field label')).toHaveTextContent('My field');
      });

      it('should render a select widget with multiple attribute', () => {
        const { node } = createFormComponent({ schema });

        expect(node.querySelector('.field select').getAttribute('multiple')).not.toBeNull();
      });

      it('should render options', () => {
        const { node } = createFormComponent({ schema });

        expect(node.querySelectorAll('select option')).toHaveLength(3);
      });

      it('should handle a change event', () => {
        const { node, onChange } = createFormComponent({ schema });

        Simulate.change(node.querySelector('.field select'), {
          target: {
            options: [
              { selected: true, value: 'foo' },
              { selected: true, value: 'bar' },
              { selected: false, value: 'fuzz' },
            ],
          },
        });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: ['foo', 'bar'],
          })
        );
      });

      it('should handle a blur event', () => {
        const onBlur = jest.fn();
        const { node } = createFormComponent({ schema, onBlur });

        const select = node.querySelector('.field select');
        Simulate.blur(select, {
          target: {
            options: [
              { selected: true, value: 'foo' },
              { selected: true, value: 'bar' },
              { selected: false, value: 'fuzz' },
            ],
          },
        });

        expect(onBlur).toHaveBeenCalledWith(select.id, ['foo', 'bar']);
      });

      it('should handle a focus event', () => {
        const onFocus = jest.fn();
        const { node } = createFormComponent({ schema, onFocus });

        const select = node.querySelector('.field select');
        Simulate.focus(select, {
          target: {
            options: [
              { selected: true, value: 'foo' },
              { selected: true, value: 'bar' },
              { selected: false, value: 'fuzz' },
            ],
          },
        });

        expect(onFocus).toHaveBeenCalledWith(select.id, ['foo', 'bar']);
      });

      it('should fill field with data', () => {
        const { node } = createFormComponent({
          schema,
          formData: ['foo', 'bar'],
        });

        const options = node.querySelectorAll('.field select option');
        expect(options).toHaveLength(3);
        expect(options[0].selected).toBe(true); // foo
        expect(options[1].selected).toBe(true); // bar
        expect(options[2].selected).toBe(false); // fuzz
      });

      it('should render the select widget with the expected id', () => {
        const { node } = createFormComponent({ schema });

        expect(node.querySelector('select').id).toBe('root');
      });
    });

    describe('CheckboxesWidget', () => {
      const uiSchema = {
        'ui:widget': 'checkboxes',
      };

      it('should render the expected number of checkboxes', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelectorAll('[type=checkbox]')).toHaveLength(3);
      });

      it('should render the expected labels', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        const labels = [].map.call(node.querySelectorAll('.checkbox label'), node => node.textContent);
        expect(labels).toStrictEqual(['foo', 'bar', 'fuzz']);
      });

      it('should handle a change event', () => {
        const { node, onChange } = createFormComponent({
          schema,
          uiSchema,
        });

        Simulate.change(node.querySelectorAll('[type=checkbox]')[0], {
          target: { checked: true },
        });
        Simulate.change(node.querySelectorAll('[type=checkbox]')[2], {
          target: { checked: true },
        });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: ['foo', 'fuzz'],
          })
        );
      });

      it('should fill field with data', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema,
          formData: ['foo', 'fuzz'],
        });

        const labels = [].map.call(node.querySelectorAll('[type=checkbox]'), node => node.checked);
        expect(labels).toStrictEqual([true, false, true]);
      });

      it('should render the widget with the expected id', () => {
        const { node } = createFormComponent({ schema, uiSchema });

        expect(node.querySelector('.checkboxes').id).toBe('root');
      });

      it('should support inline checkboxes', () => {
        const { node } = createFormComponent({
          schema,
          uiSchema: {
            'ui:widget': 'checkboxes',
            'ui:options': {
              inline: true,
            },
          },
        });

        expect(node.querySelectorAll('.checkbox-inline')).toHaveLength(3);
      });
    });
  });

  describe('Multiple files field', () => {
    const schema = {
      type: 'array',
      title: 'My field',
      items: {
        type: 'string',
        format: 'data-url',
      },
    };

    it('should render an input[type=file] widget', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('input[type=file]')).toHaveLength(1);
    });

    it('should render a select widget with a label', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.field label')).toHaveTextContent('My field');
    });

    it('should render a file widget with multiple attribute', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('.field [type=file]').getAttribute('multiple')).not.toBeNull();
    });

    it('should handle a change event', async () => {
      jest.spyOn(window, 'FileReader').mockImplementation(() => ({
        set onload(fn) {
          fn({ target: { result: 'data:text/plain;base64,x=' } });
        },
        readAsDataUrl() {},
      }));

      const { node, onChange } = createFormComponent({ schema });

      Simulate.change(node.querySelector('.field input[type=file]'), {
        target: {
          files: [
            { name: 'file1.txt', size: 1, type: 'type' },
            { name: 'file2.txt', size: 2, type: 'type' },
          ],
        },
      });

      await new Promise(setImmediate);

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: ['data:text/plain;name=file1.txt;base64,x=', 'data:text/plain;name=file2.txt;base64,x='],
        })
      );
    });

    it('should fill field with data', () => {
      const { node } = createFormComponent({
        schema,
        formData: [
          'data:text/plain;name=file1.txt;base64,dGVzdDE=',
          'data:image/png;name=file2.png;base64,ZmFrZXBuZw==',
        ],
      });

      const li = node.querySelectorAll('.file-info li');

      expect(li).toHaveLength(2);
      expect(li[0]).toHaveTextContent('file1.txt (text/plain, 5 bytes)');
      expect(li[1]).toHaveTextContent('file2.png (image/png, 7 bytes)');
    });

    it('should render the file widget with the expected id', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelector('input[type=file]').id).toBe('root');
    });
  });

  describe('Nested lists', () => {
    const schema = {
      type: 'array',
      title: 'A list of arrays',
      items: {
        type: 'array',
        title: 'A list of numbers',
        items: {
          type: 'number',
        },
      },
    };

    it('should render two lists of inputs inside of a list', () => {
      const { node } = createFormComponent({
        schema,
        formData: [
          [1, 2],
          [3, 4],
        ],
      });
      expect(node.querySelectorAll('fieldset fieldset')).toHaveLength(2);
    });

    it('should add an inner list when clicking the add button', () => {
      const { node } = createFormComponent({ schema });
      expect(node.querySelectorAll('fieldset fieldset')).toHaveLength(0);

      Simulate.click(node.querySelector('.array-item-add button'));

      expect(node.querySelectorAll('fieldset fieldset')).toHaveLength(1);
    });
  });

  describe('Fixed items lists', () => {
    const schema = {
      type: 'array',
      title: 'List of fixed items',
      items: [
        {
          type: 'string',
          title: 'Some text',
        },
        {
          type: 'number',
          title: 'A number',
        },
      ],
    };

    const schemaAdditional = {
      type: 'array',
      title: 'List of fixed items',
      items: [
        {
          type: 'number',
          title: 'A number',
        },
        {
          type: 'number',
          title: 'Another number',
        },
      ],
      additionalItems: {
        type: 'string',
        title: 'Additional item',
      },
    };

    it('should render a fieldset', () => {
      const { node } = createFormComponent({ schema });

      expect(node.querySelectorAll('fieldset')).toHaveLength(1);
    });

    it('should render a fieldset legend', () => {
      const { node } = createFormComponent({ schema });
      const legend = node.querySelector('fieldset > legend');
      expect(legend).toHaveTextContent('List of fixed items');
      expect(legend.id).toBe('root__title');
    });

    it('should render field widgets', () => {
      const { node } = createFormComponent({ schema });
      const strInput = node.querySelector('fieldset .field-string input[type=text]');
      const numInput = node.querySelector('fieldset .field-number input[type=number]');
      expect(strInput.id).toBe('root_0');
      expect(numInput.id).toBe('root_1');
    });

    it('should mark non-null item widgets as required', () => {
      const { node } = createFormComponent({ schema });
      const strInput = node.querySelector('fieldset .field-string input[type=text]');
      const numInput = node.querySelector('fieldset .field-number input[type=number]');
      expect(strInput).toBeRequired();
      expect(numInput).toBeRequired();
    });

    it('should fill fields with data', () => {
      const { node } = createFormComponent({
        schema,
        formData: ['foo', 42],
      });
      const strInput = node.querySelector('fieldset .field-string input[type=text]');
      const numInput = node.querySelector('fieldset .field-number input[type=number]');
      expect(strInput.value).toBe('foo');
      expect(numInput.value).toBe('42');
    });

    it('should handle change events', () => {
      const { node, onChange } = createFormComponent({ schema });
      const strInput = node.querySelector('fieldset .field-string input[type=text]');
      const numInput = node.querySelector('fieldset .field-number input[type=number]');

      Simulate.change(strInput, { target: { value: 'bar' } });
      Simulate.change(numInput, { target: { value: '101' } });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: ['bar', 101],
        })
      );
    });

    it('should generate additional fields and fill data', () => {
      const { node } = createFormComponent({
        schema: schemaAdditional,
        formData: [1, 2, 'bar'],
      });
      const addInput = node.querySelector('fieldset .field-string input[type=text]');
      expect(addInput.id).toBe('root_2');
      expect(addInput.value).toBe('bar');
    });

    it('should apply uiSchema to additionalItems', () => {
      const { node } = createFormComponent({
        schema: schemaAdditional,
        uiSchema: {
          additionalItems: {
            'ui:title': 'Custom title',
          },
        },
        formData: [1, 2, 'bar'],
      });
      const label = node.querySelector('fieldset .field-string label.control-label');
      expect(label).toHaveTextContent('Custom title*');
    });

    it('should have an add button if additionalItems is an object', () => {
      const { node } = createFormComponent({ schema: schemaAdditional });
      expect(node.querySelector('.array-item-add button')).not.toBeNull();
    });

    it('should not have an add button if additionalItems is not set', () => {
      const { node } = createFormComponent({ schema });
      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('should not have an add button if addable is false', () => {
      const { node } = createFormComponent({
        schema,
        uiSchema: { 'ui:options': { addable: false } },
      });
      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('[fixed-noadditional] should not provide an add button regardless maxItems', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 3, ...schema },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('[fixed] should not provide an add button if length equals maxItems', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schemaAdditional },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('[fixed] should provide an add button if length is lesser than maxItems', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 3, ...schemaAdditional },
      });

      expect(node.querySelector('.array-item-add button')).not.toBeNull();
    });

    it('[fixed] should not provide an add button if addable is expliclty false regardless maxItems value', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        uiSchema: {
          'ui:options': {
            addable: false,
          },
        },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    it('[fixed] should ignore addable value if maxItems constraint is not satisfied', () => {
      const { node } = createFormComponent({
        schema: { maxItems: 2, ...schema },
        uiSchema: {
          'ui:options': {
            addable: true,
          },
        },
      });

      expect(node.querySelector('.array-item-add button')).toBeNull();
    });

    describe('operations for additional items', () => {
      const { node, onChange } = createFormComponent({
        schema: schemaAdditional,
        formData: [1, 2, 'foo'],
        ArrayFieldTemplate: ExposedArrayKeyTemplate,
      });

      const startRows = node.querySelectorAll('.array-item');
      const startRow1_key = startRows[0].getAttribute(ArrayKeyDataAttr);
      const startRow2_key = startRows[1].getAttribute(ArrayKeyDataAttr);
      const startRow3_key = startRows[2].getAttribute(ArrayKeyDataAttr);
      const startRow4_key = startRows[3] ? startRows[3].getAttribute(ArrayKeyDataAttr) : undefined;

      it('should add a field when clicking add button', () => {
        const addBtn = node.querySelector('.array-item-add button');

        Simulate.click(addBtn);

        expect(node.querySelectorAll('.field-string')).toHaveLength(2);

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: [1, 2, 'foo', undefined],
          })
        );
      });

      it('should retain existing row keys/ids when adding additional items', () => {
        const endRows = node.querySelectorAll('.array-item');
        const endRow1_key = endRows[0].getAttribute(ArrayKeyDataAttr);
        const endRow2_key = endRows[1].getAttribute(ArrayKeyDataAttr);
        const endRow3_key = endRows[2].getAttribute(ArrayKeyDataAttr);
        const endRow4_key = endRows[3].getAttribute(ArrayKeyDataAttr);

        expect(startRow1_key).toBe(endRow1_key);
        expect(startRow2_key).toBe(endRow2_key);
        expect(startRow3_key).toBe(endRow3_key);

        expect(startRow4_key).not.toBe(endRow4_key);
        expect(startRow4_key).toBeUndefined();
        expect(endRows[0]).toHaveAttribute(ArrayKeyDataAttr);
        expect(endRows[1]).toHaveAttribute(ArrayKeyDataAttr);
        expect(endRows[2]).toHaveAttribute(ArrayKeyDataAttr);
        expect(endRows[3]).toHaveAttribute(ArrayKeyDataAttr);
      });

      it('should change the state when changing input value', () => {
        const inputs = node.querySelectorAll('.field-string input[type=text]');

        Simulate.change(inputs[0], { target: { value: 'bar' } });
        Simulate.change(inputs[1], { target: { value: 'baz' } });

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: [1, 2, 'bar', 'baz'],
          })
        );
      });

      it('should remove array items when clicking remove buttons', () => {
        let dropBtns = node.querySelectorAll('.array-item-remove');

        Simulate.click(dropBtns[0]);

        expect(node.querySelectorAll('.field-string')).toHaveLength(1);

        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: [1, 2, 'baz'],
          })
        );

        dropBtns = node.querySelectorAll('.array-item-remove');
        Simulate.click(dropBtns[0]);

        expect(node.querySelectorAll('.field-string')).toHaveLength(0);
        expect(onChange).toHaveBeenLastCalledWith(
          expect.objectContaining({
            formData: [1, 2],
          })
        );
      });
    });
  });

  describe('Multiple number choices list', () => {
    const schema = {
      type: 'array',
      title: 'My field',
      items: {
        enum: [1, 2, 3],
        type: 'integer',
      },
      uniqueItems: true,
    };

    it("should convert array of strings to numbers if type of items is 'number'", () => {
      const { node, onChange } = createFormComponent({ schema });

      Simulate.change(node.querySelector('.field select'), {
        target: {
          options: [
            { selected: true, value: '1' },
            { selected: true, value: '2' },
            { selected: false, value: '3' },
          ],
        },
      });

      expect(onChange).toHaveBeenLastCalledWith(
        expect.objectContaining({
          formData: [1, 2],
        })
      );
    });
  });

  describe('Title', () => {
    const TitleField = props => <div id={`title-${props.title}`} />;

    const fields = { TitleField };

    it('should pass field name to TitleField if there is no title', () => {
      const schema = {
        type: 'object',
        properties: {
          array: {
            type: 'array',
            items: {},
          },
        },
      };

      const { node } = createFormComponent({ schema, fields });
      expect(node.querySelector('#title-array')).not.toBeNull();
    });

    it('should pass schema title to TitleField', () => {
      const schema = {
        type: 'array',
        title: 'test',
        items: {},
      };

      const { node } = createFormComponent({ schema, fields });
      expect(node.querySelector('#title-test')).not.toBeNull();
    });

    it('should pass empty schema title to TitleField', () => {
      const schema = {
        type: 'array',
        title: '',
        items: {},
      };
      const { node } = createFormComponent({ schema, fields });
      expect(node.querySelector('#title-')).toBeNull();
    });
  });
});
