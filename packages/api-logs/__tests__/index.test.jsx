require('isomorphic-fetch');

const React = require('react');
const { shallow } = require('enzyme');
const nock = require('nock');

const { Logs, LogsEmitter } = require('../index.jsx');
const requestmodel = require('./fixtures/requestmodel.json');
const oas = require('./fixtures/oas.json');
const operation = require('./fixtures/operation.json');

const baseUrl = 'https://metrics.readme.io/';

class LogTest extends Logs {
  // eslint-disable-next-line class-methods-use-this
  getData() {
    return new Promise(resolve => {
      resolve([requestmodel]);
    });
  }
}

describe('Logs', () => {
  const props = {
    query: {
      url: `${oas.servers[0].url}${operation.path}`,
      method: operation.method,
    },
    user: {
      name: 'Gilfoyle',
      email: 'gilfoyle@piedpiper.com',
      isAdmin: true,
      id: 'someid',
    },
    baseUrl,
  };

  test('should not render if user_data does not have id or keys.id', () => {
    const noUser = { baseUrl, query: {} };
    const comp = shallow(<LogTest {...noUser} />);

    expect(comp.html()).toBe(null);
  });

  test('should render a log with no user-agent', () => {
    const comp = shallow(<LogTest {...props} />);
    const clonedLog = JSON.parse(JSON.stringify(requestmodel));
    clonedLog.request.log.entries[0].request.headers[0].name = '';
    comp.setState({ logs: [clonedLog] });

    expect(
      comp
        .find('tbody tr')
        .childAt(4)
        .text(),
    ).toBe('-');
  });

  test('should be in a loading state', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.setState({ loading: true });

    expect(comp.find('.loading-container').length).toBe(1);
  });

  test('should fetch based on query with page/limit', async () => {
    const comp = shallow(<Logs {...props} />);

    const mock = nock('https://metrics.readme.io:443', { encodedQueryParams: true })
      .get('/api/logs')
      .query({
        url: 'https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D',
        id: null,
        method: 'delete',
        limit: 5,
        page: 0,
      })
      .reply(200, [requestmodel]);

    await comp.instance().getData();

    mock.done();
  });

  test('should fetch with group if passed', async () => {
    const comp = shallow(<Logs {...props} />);

    const mock = nock('https://metrics.readme.io:443', { encodedQueryParams: true })
      .get('/api/logs')
      .query({
        url: 'https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D',
        id: 'someid',
        method: 'delete',
        limit: 5,
        page: 0,
      })
      .reply(200, [requestmodel]);

    await comp.instance().getData('someid');

    mock.done();
  });

  test('should render a "view more" button', () => {
    const comp = shallow(<LogTest {...props} />);
    expect(comp.find('a[target="_blank"]').prop('href')).toBe(
      'https://metrics.readme.io/logs?url=https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D&method=delete&id=someid',
    );
  });

  test('should render with id', () => {
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
      keys: [{ id: 'one', name: 'one' }, { id: 'two', name: 'two' }],
    };
    props.user = userData;

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

  test('open window on log visit', () => {
    const comp = shallow(<Logs {...props} />);
    global.open = jest.fn();
    const instance = comp.instance();
    instance.visitLogItem(requestmodel);
    expect(global.open).toBeCalled();
  });

  test('on stale call refresh', () => {
    const comp = shallow(<Logs {...props} />);
    comp.setState({ stale: true });
    const instance = comp.instance();
    jest.spyOn(instance, 'refresh');
    instance.onVisible();
    expect(instance.refresh).toHaveBeenCalledWith('1230');
  });

  test('remove listener on component unmount', () => {
    const comp = shallow(<Logs {...props} />);
    comp.setState({ stale: true });
    const instance = comp.instance();
    instance.componentWillUnmount();
    expect(LogsEmitter.listeners().length).toBe(0);
  });

  test('when parsed agent is not Other', () => {
    const comp = shallow(<LogTest {...props} />);
    requestmodel.request.log.entries[0].request.headers[0].value = 'IE4.0';
    comp.setState({ logs: [requestmodel] });
    expect(comp.contains(<td>IE4.0</td>)).toBe(true);
  });
});
