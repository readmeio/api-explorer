import 'isomorphic-fetch';

const React = require('react');
const { shallow } = require('enzyme');
const Cookie = require('js-cookie');

const { Logs } = require('../index.jsx');
const requestmodel = require('./fixtures/requestmodel.json');
const oas = require('./fixtures/oas.json');
const operation = require('./fixtures/operation.json');
const Oas = require('../lib/Oas.js');

const { Operation } = Oas;

class LogTest extends Logs {
  getData() { // eslint-disable-line class-methods-use-this
    return new Promise((resolve) => {
      resolve([requestmodel]);
    });
  }
}


describe('Logs', () => {
  const props = {
    oas: new Oas(oas),
    operation: new Operation(operation),
  };

  test('should not render if user_data does not have id or keys.id', () => {
    const comp = shallow(<LogTest {...props} />);

    expect(comp.html()).toBe(null);
  });

  test('should be in a loading state', () => {
    const userData = {
      name: 'Gilfoyle',
      email: 'gilfoyle@piedpiper.com',
      isAdmin: true,
      id: 'someid',
    };
    Cookie.set('user_data', JSON.stringify(userData));
    const comp = shallow(<LogTest {...props} />);
    comp.setState({ loading: true })

    expect(comp.find('.loading-container').length).toBe(1);
  });

  test('should render with id', () => {
    const userData = {
      name: 'Gilfoyle',
      email: 'gilfoyle@piedpiper.com',
      isAdmin: true,
      id: 'someid',
    };
    Cookie.set('user_data', JSON.stringify(userData));

    const comp = shallow(<LogTest {...props} />);
    comp.setState({ logs: [requestmodel] });

    expect(comp.instance().state.group).toBe('someid');
    expect(comp.find('table').length).toBe(1);
  });

  test('should render with key', () => {

    const userData = {
      name: 'Gilfoyle',
      email: 'gilfoyle@piedpiper.com',
      isAdmin: true,
      keys: [
        { id: 'one', name: 'one' },
        { id: 'two', name: 'two' },
      ],
    };
    Cookie.set('user_data', JSON.stringify(userData));

    const comp = shallow(<LogTest {...props} />);
    comp.setState({ logs: [requestmodel] });

    expect(comp.instance().state.group).toBe('one');
    expect(comp.instance().state.groups.length).toBe(2);
    expect(comp.find('table').length).toBe(1);
  });

  test('should throw for invalid fetch', () => {
    const comp = shallow(<Logs {...props} />);
    expect(comp.instance().getData).toThrow();
  });

  test('should throw when response is 500', () => {
    const comp = shallow(<Logs {...props} />);
    const response = {
      status: 500,
    };
    expect(comp.instance().handleData.bind(comp.instance(), response)).toThrow();
  });

  test('should set logs when response is 200', () => {
    const comp = shallow(<Logs {...props} />);
    const response = {
      status: 200,
      json: () => [requestmodel],
    };
    const result = comp.instance().handleData(response);
    expect(result.length).toBe(1);
  });

  test('on select change', () => {
    const comp = shallow(<Logs {...props} />);
    const instance = comp.instance();
    instance.onSelect({
      target: {
        value: '1230',
      },
    });
    expect(instance.state.group).toBe('1230');
  });

  test('when parsed agent is not Other', () => {
    const comp = shallow(<LogTest {...props} />);
    requestmodel.request.log.entries[0].request.headers[0].value = 'IE4.0';
    comp.setState({ logs: [requestmodel] });
    expect(comp.contains(<td>IE4.0</td>)).toBe(true);
  });
});
