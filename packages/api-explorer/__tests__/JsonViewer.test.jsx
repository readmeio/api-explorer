import React from 'react'
import { FormattedMessage } from 'react-intl';
import ReactTestUtils from 'react-dom/test-utils'
import { mountWithIntl, loadTranslationObject, shallowWithIntl } from 'enzyme-react-intl'
import ReactJson from 'react-json-view'
import { Button } from 'antd';

import strings from '../i18n/en.json'
import JsonViewer from '../src/components/JsonViewer';

describe('JsonViewer', () => {
  loadTranslationObject({
    ...strings,
    'foo.id': 'missing schema'
  })

  test('if schema is defined renders ReactJson', () => {
    const props = {
      schema: {
        foo: 'bar'
      },
      missingMessage: 'foo.id'
    }
    const element = mountWithIntl(<JsonViewer {...props} />)
    const reactJson = element.find(ReactJson)
    expect(reactJson).toHaveLength(1)
    expect(reactJson.prop('src')).toEqual(props.schema)
    expect(element.getDOMNode()).toMatchSnapshot()
  })

  test('if schema is undefined renders missing message', () => {
    const props = {
      missingMessage: 'foo.id'
    }
    const element = shallowWithIntl(<JsonViewer {...props} />)
    const formattedMessage = element.find(FormattedMessage)
    expect(formattedMessage).toHaveLength(1)
    expect(formattedMessage.prop('id')).toEqual(props.missingMessage)
  })

  describe('Expand - Collapse button', () => {
    const schema = {
      foo: {
        bar: {
          lorem: 'ipsum'
        },
        something: {
          else: {
            else: {
              else: 'example'
            }
          }
        }
      }
    }
    let element
    beforeEach(() => {
      element = mountWithIntl(<JsonViewer schema={schema} missingMessage={'missing'} />)
    })

    test('is collapsed as default', () => {
      checkCollapse(element, {isCollapsed: true})

      expect(element.getDOMNode()).toMatchSnapshot()
    })

    test('expand when click button', () => {
      clickExpandButton(element)
      checkCollapse(element, {isCollapsed: false})

      expect(element.getDOMNode()).toMatchSnapshot()
    })

    test('flow', () => {
      checkCollapse(element, {isCollapsed: true})

      clickExpandButton(element)
      checkCollapse(element, {isCollapsed: false})
      
      clickExpandButton(element)
      checkCollapse(element, {isCollapsed: true})
      
      clickExpandButton(element)
      checkCollapse(element, {isCollapsed: false})
    })
  })
})

function clickExpandButton(element) {
  const button = getCollapseButton(element)
  ReactTestUtils.act(() => {
    button.prop('onClick')()
  })
  element.update()
}

function checkCollapse(element, {isCollapsed}) {
  if (isCollapsed) {
    expect(element.find(ReactJson).prop('collapsed')).toEqual(1)
    expect(element.findWhere(node => node.type() === FormattedMessage && node.prop('id') === 'schemas.expand')).toHaveLength(1)
    return
  }
  expect(element.find(ReactJson).prop('collapsed')).toEqual(10)
  expect(element.findWhere(node => node.type() === FormattedMessage && node.prop('id') === 'schemas.collapse')).toHaveLength(1)
}

function getCollapseButton (element) {
  const formattedMessage = element
    .findWhere(node => node.type() === FormattedMessage && 
      (node.prop('id') === 'schemas.collapse' || node.prop('id') === 'schemas.expand'))
  return formattedMessage.closest(Button)
}