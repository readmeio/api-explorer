import {IntlProvider} from 'react-intl';
import CopyCode from '../src/components/CopyCode'

const React = require('react');
const { shallow, mount } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');

const Response = require('../src/components/Response');
const ResponseMetadata = require('../src/components/Response/ResponseMetadata')
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);

const props = {
  result: null,
  operation: new Operation({}, '/pet', 'post'),
  hideResults: () => {},
  oas,
  oauth: false,
};

describe('no result', () => {
  test('nothing should render', () => {
    const codeSampleResponseTabs = shallow(<Response {...props} />);

    expect(codeSampleResponseTabs.find('span').length).toBe(0);
  });
});

describe('setTab', () => {
  test('setTab should change state of selectedTab', () => {
    const doc = shallow(<Response {...props} />);

    expect(doc.state('responseTab')).toBe('result');

    doc.instance().setTab('metadata');

    expect(doc.state('responseTab')).toBe('metadata');

    doc.instance().setTab('result');

    expect(doc.state('responseTab')).toBe('result');
  });
});

describe('exampleTab', () => {
  test('exampleTab should change state of exampleTab', () => {
    const doc = shallow(<Response {...props} />);

    expect(doc.state('exampleTab')).toBe(0);

    doc.instance().setExampleTab(1);

    expect(doc.state('exampleTab')).toBe(1);
  });
});

test('and CopyCode is rendered correctly with a responseBody !== string', () => {
  const customProps = {
    ...props,
    result: {
      ...props.result,
      responseBody: {test: 1}
    }
  }
  const doc = shallow(<Response {...customProps} />);
  expect(doc.find(CopyCode).prop('code')).toEqual("{\"test\":1}")
})

test('and CopyCode is rendered correctly with a result binary', () => {
  const customProps = {
    ...props,
    result: {
      ...props.result,
      responseBody: {test: 1},
      type: 'application/json'
    }
  }
  const doc = shallow(<Response {...customProps} />);
  expect(doc.find(CopyCode).prop('code')).toEqual("{\"test\":1}")
  expect(doc.state().collapse).toEqual(undefined)

  const buttons = doc.find('.mia-ctc-button')
  const collapseButton = buttons.at(0)
  collapseButton.simulate('click', {preventDefault: jest.fn()})
  expect(doc.state().collapse).toEqual(true)

  const expandbutton = buttons.at(1)
  expandbutton.simulate('click', {preventDefault: jest.fn()})
  expect(doc.state().collapse).toEqual(false)
})

test('and CopyCode is rendered correctly with a responseBody === string', () => {
  const customProps = {
    ...props,
    result: {
      ...props.result,
      responseBody: 'testResponseBody'
    }
  }
  const doc = shallow(<Response {...customProps} />);
  expect(doc.find(CopyCode).prop('code')).toEqual(customProps.result.responseBody)
})

test('should show different component tabs based on state', () => {
  const wrapper = mount(
    <IntlProvider>
      <Response
        {...props}
        result={{
          status: 200,
          responseBody: JSON.stringify({ a: 1 }),
          requestBody: JSON.stringify({ b: 2 }),
          requestHeaders: [],
          method: 'post',
          responseHeaders: [],
        }}
      />
    </IntlProvider>
  );
  expect(wrapper.find('ResponseBody').length).toBe(1);

  const doc = wrapper.find(Response);
  doc.instance().setTab('metadata');

  // I want to do the below assertion instead, but it's not working
  // expect(doc.find('ResponseMetadata').length).toBe(1);
  expect(doc.html().includes('Response Headers')).toBe(true);

  // Should include request body in HTML
  expect(doc.html().includes('Request Data')).toBe(true);
  expect(doc.html().includes(JSON.stringify({ b: 2 }))).toBe(true);
});

describe('renders ResponseMetadata correctly', () => {
  test('renders 6 Meta if requestBody is set', (done) => {
    const wrapper = mount(
      <IntlProvider>
        <Response
          {...props}
          result={{
            status: 200,
            responseBody: JSON.stringify({ a: 1 }),
            requestBody: JSON.stringify({ b: 2 }),
            requestHeaders: [],
            method: 'post',
            responseHeaders: [],
          }}
        />
      </IntlProvider>
    );
    const doc = wrapper.find(Response);
    doc.setState({
      responseTab: 'metadata'
    })
    wrapper.update()
    setTimeout(() => {
      const metadata = wrapper.find(ResponseMetadata)
      expect(metadata.find('Meta')).toHaveLength(6)
      done()
    })
  })

  test('renders 5 Meta if requestBody is not set', (done) => {
    const wrapper = mount(
      <IntlProvider>
        <Response
          {...props}
          result={{
            status: 200,
            responseBody: JSON.stringify({ a: 1 }),
            requestBody: null,
            requestHeaders: [],
            method: 'post',
            responseHeaders: [],
          }}
        />
      </IntlProvider>
    );
    const doc = wrapper.find(Response);
    doc.setState({
      responseTab: 'metadata'
    })
    wrapper.update()
    setTimeout(() => {
      const metadata = wrapper.find(ResponseMetadata)
      expect(metadata.find('Meta')).toHaveLength(5)
      done()
    })
  })

  test('renders Response headers correctly', (done) => {
    const resultResponseHeaders = [
      {
        name: 'header-1',
        value: 'value-header-1'
      }, {
        name: 'header-2',
        value: 'value-header-2'
      }, {
        name: 'header-3',
        value: 'value-header-3'
      }, {
        name: 'header-no-value',
        value: null
      }
    ]
    const wrapper = mount(
      <IntlProvider>
        <Response
          {...props}
          result={{
            status: 200,
            responseBody: JSON.stringify({ a: 1 }),
            requestBody: null,
            requestHeaders: [],
            method: 'post',
            responseHeaders: resultResponseHeaders,
          }}
        />
      </IntlProvider>
    );
    const doc = wrapper.find(Response);
    doc.setState({
      responseTab: 'metadata'
    })
    wrapper.update()
    setTimeout(() => {
      const metadata = wrapper.find(ResponseMetadata)
      const responseHeaders = metadata.findWhere(node => node.prop('label') === 'Response Headers')
      expect(responseHeaders).toHaveLength(1)
      expect(responseHeaders.find('span')).toHaveLength(resultResponseHeaders.length*2)
      expect(responseHeaders.html()).toMatchSnapshot()
      done()
    })
  })
})
