require('isomorphic-fetch');

const React = require('react');
const { shallow } = require('enzyme');
const nock = require('nock');

const { Logs } = require('../index.jsx');
const requestmodel = require('./fixtures/requestmodel.json');
const oas = require('./fixtures/oas.json');
const operation = require('./fixtures/operation.json');

const baseUrl = 'https://docs.readme.com';

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
    baseUrl,
    group: 'someid',
    groups: [
      {
        id: '1',
        name: 'someid',
      },
      {
        id: '2',
        name: 'anotherId',
      },
    ],
    changeGroup: jest.fn(),
    result: {},
  };

  test('should not render if groups are not populated', () => {
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

  test('should call refresh and set state when group props are updated via parent', done => {
    const comp = shallow(<LogTest {...props} />);
    comp.instance().refresh = jest.fn();
    comp.setProps({ group: 'testnew' });
    expect(comp.instance().refresh).toHaveBeenCalledTimes(1);
    expect(comp.instance().state.logs).toMatchObject([]);
    done();
  });

  test('should call refresh when result props are updated via parent', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.instance().refresh = jest.fn();
    comp.setProps({ result: { newResult: true } });
    expect(comp.instance().refresh).toHaveBeenCalledTimes(1);
  });

  test('should fetch based on query with page/limit', async () => {
    const comp = shallow(<Logs {...props} />);

    const mock = nock('https://docs.readme.com:443', { encodedQueryParams: true })
      .get('/api/logs')
      .query({
        url: 'https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D',
        id: 'someid',
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

    const mock = nock('https://docs.readme.com', { encodedQueryParams: true })
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
      'https://docs.readme.com/logs?url=https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D&method=delete&id=someid',
    );
  });

  test('should render with id', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.setState({ logs: [requestmodel] });

    expect(comp.instance().props.group).toBe('someid');
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
    expect(instance.props.changeGroup).toHaveBeenCalledWith('1230');
  });

  test('open window on log visit', () => {
    const comp = shallow(<Logs {...props} />);
    global.open = jest.fn();
    const instance = comp.instance();
    instance.visitLogItem(requestmodel);
    expect(global.open).toBeCalled();
  });

  test('when parsed agent is not Other', () => {
    const comp = shallow(<LogTest {...props} />);
    requestmodel.request.log.entries[0].request.headers[0].value = 'IE4.0';
    comp.setState({ logs: [requestmodel] });
    expect(comp.contains(<td>IE4.0</td>)).toBe(true);
  });

  test('should always return a absolute url', async () => {
    props.baseUrl = 'https://docs.readme.com/subdomain';
    const comp = shallow(<Logs {...props} />);

    const mock = nock('https://docs.readme.com/subdomain', { encodedQueryParams: true })
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
});
