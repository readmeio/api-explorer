require('isomorphic-fetch');

const React = require('react');
const { shallow } = require('enzyme');
const nock = require('nock');

const { Logs, checkFreshness, handleResponse } = require('../index.jsx');
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

  it('should render prompt to log in if groups are not populated', () => {
    const noUser = { baseUrl, query: {}, changeGroup: () => {} };
    const comp = shallow(<LogTest {...noUser} />);

    expect(comp.html()).toContain('Log in to view your API logs for this endpoint');
  });

  it('should render a log with no user-agent', () => {
    const comp = shallow(<LogTest {...props} />);
    const clonedLog = JSON.parse(JSON.stringify(requestmodel));
    clonedLog.requestHeaders[0].name = '';
    comp.setState({ logs: [clonedLog] });

    expect(comp.find('tbody tr').childAt(4).text()).toBe('-');
  });

  it('should be in a loading state', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.setState({ loading: true });

    expect(comp.find('.loading-container')).toHaveLength(1);
  });

  it('should call refresh and set state when group props are updated via parent', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.instance().getLogs = jest.fn();
    comp.setProps({ group: 'testnew' });
    expect(comp.instance().getLogs).toHaveBeenCalledTimes(1);
    expect(comp.instance().state.logs).toMatchObject([]);
  });

  it('should make multiple requests for logs if conditional check fails', async () => {
    const comp = shallow(<Logs {...props} />);
    comp.setState({
      logs: [requestmodel],
    });

    const mock = nock('https://docs.readme.com:443', { encodedQueryParams: true })
      .get('/api/logs')
      .query({
        url: 'https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D',
        id: 'someid',
        method: 'delete',
        limit: 5,
        page: 0,
      })
      .reply(200, [requestmodel])
      .get('/api/logs')
      .query({
        url: 'https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D',
        id: 'someid',
        method: 'delete',
        limit: 5,
        page: 0,
      })
      .reply(200, [
        {
          ...requestmodel,
          _id: '2',
        },
      ]);

    await comp.instance().iterativeGetLogs();
    expect(comp.instance().state.logs[0]._id).toBe('2');
    mock.done();
  });

  it('should call refresh when result props are updated via parent', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.instance().iterativeGetLogs = jest.fn();
    comp.setProps({ result: { newResult: true } });
    expect(comp.instance().iterativeGetLogs).toHaveBeenCalledTimes(1);
  });

  it('should fetch based on query with page/limit', async () => {
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

    await comp.instance().getLogs();

    mock.done();
  });

  it('should fetch with group if passed', async () => {
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

    await comp.instance().getLogs('someid');

    mock.done();
  });

  it('should not fetch if no group is present', () => {
    const comp = shallow(<Logs {...props} />);

    comp.instance().getLogs = jest.fn();
    expect(comp.instance().getLogs).not.toHaveBeenCalled();
  });

  it('should render a "view more" button', () => {
    const comp = shallow(<LogTest {...props} />);
    expect(comp.find('a[target="_blank"]').prop('href')).toBe(
      'https://docs.readme.com/logs?url=https%3A%2F%2Fdash.readme.io%2Fapi%2Fv1%2Fdocs%2F%7Bslug%7D&method=delete&id=someid'
    );
  });

  it('should render with id', () => {
    const comp = shallow(<LogTest {...props} />);
    comp.setState({ logs: [requestmodel] });

    expect(comp.instance().props.group).toBe('someid');
    expect(comp.find('table')).toHaveLength(1);
  });

  it('on select change', () => {
    const comp = shallow(<Logs {...props} />);
    const instance = comp.instance();
    instance.onSelect({
      target: {
        value: '1230',
      },
    });
    expect(instance.props.changeGroup).toHaveBeenCalledWith('1230');
  });

  it('open window on log visit', () => {
    const comp = shallow(<Logs {...props} />);
    global.open = jest.fn();
    const instance = comp.instance();
    instance.visitLogItem(requestmodel);
    expect(global.open).toHaveBeenCalled();
  });

  it('when parsed agent is not Other', () => {
    const comp = shallow(<LogTest {...props} />);
    requestmodel.requestHeaders[0].value = 'IE4.0';
    comp.setState({ logs: [requestmodel] });
    expect(comp.contains(<td>IE4.0</td>)).toBe(true);
  });

  it('should always return a absolute url', async () => {
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

    await comp.instance().getLogs('someid');

    mock.done();
  });
});

describe('handleResponse()', () => {
  it('should throw when response is 500', () => {
    expect(() => {
      handleResponse({ status: 500 });
    }).toThrow('Failed to fetch logs');
  });

  it('should set logs when response is 200', () => {
    const response = {
      status: 200,
      json: () => [requestmodel],
    };
    const result = handleResponse(response);
    expect(result).toHaveLength(1);
  });
});

describe('checkFreshness()', () => {
  it('should throw error if existing and new logs are unpopulated after request', () => {
    expect(() => {
      checkFreshness([], []);
    }).toThrow('Requested logs are not up-to-date.');
  });

  it('should throw error if new logs are unpopulated after request', () => {
    expect(() => {
      checkFreshness([{ _id: 1 }], []);
    }).toThrow('Requested logs are not up-to-date.');
  });

  it('should throw error if logs are not unique', () => {
    expect(() => {
      checkFreshness([{ _id: 1 }], [{ _id: 1 }]);
    }).toThrow('Requested logs are not up-to-date.');
  });

  it('should return incoming logs if no existing logs, and incoming logs are populated', () => {
    const res = checkFreshness([], [{ _id: 1 }]);
    expect(res[0]._id).toBe(1);
  });

  it('should return incoming logs if both args are populated and ids are unique to each other', () => {
    const res = checkFreshness([{ _id: 1 }], [{ _id: 2 }]);
    expect(res[0]._id).toBe(2);
  });
});
