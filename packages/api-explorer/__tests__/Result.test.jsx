import React from 'react'
import {shallowWithIntl as shallow} from 'enzyme-react-intl'
import ReactJson from 'react-json-view';
import {Icon, Button} from 'antd'

import Result from '../src/components/Response/Result';

describe('Result component', () => {
  const props = {
    result: {
      type: 'application/json',
      responseBody: 1,
      isBinary: false,
    }
  }

  it('does render even when responseBody is a number but content-type is application/json', () => {
    expect(() => {
      const element = shallow(<Result {...props} />)
      expect(element).not.toBe(undefined)
    }).not.toThrow()
  })

  it('does render even when responseBody is a boolean but content-type is application/json', () => {
    const caseProps = {
      ...props,
      responseBody: true,
    }
    expect(() => {
      const element = shallow(<Result {...caseProps} />)
      expect(element).not.toBe(undefined)
    }).not.toThrow()
  })

  it('renders a `ReactJson` if responseBody is an object and content-type is application/json', () => {
    const caseProps = {
      ...props,
      responseBody: {some: 'key'},
    }
    let element
    expect(() => {
      element = shallow(<Result {...caseProps} />)
      expect(element).not.toBe(undefined)
    }).not.toThrow()
    expect(element.find(ReactJson)).not.toBe(undefined)
  })

  it('and render download file if isBinary is true', () => {
    const originalOpen = global.open
    
    global.open = jest.fn();
    const caseProps = {
      ...props,
      result: {
        ...props.result,
        isBinary: true,
        type: 'application/pdf'
      },
      responseBody: 'file.pdf'
    }
    const element = shallow(<Result {...caseProps} />)
    expect(element.find(Icon).prop('type')).toEqual('download')

    element.find(Button).simulate('click')
    expect(global.open).toHaveBeenCalledWith(props.result.responseBody)

    global.open = originalOpen
  })
})
