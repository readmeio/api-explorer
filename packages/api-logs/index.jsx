const React = require('react');
const PropTypes = require('prop-types');
const querystring = require('querystring');
const retry = require('async-retry');

const LoadingSvg = props => (
  <svg
    width="38"
    height="38"
    viewBox="0 0 38 38"
    xmlns="http://www.w3.org/2000/svg"
    stroke="#2283c9"
    {...props}
  >
    <g transform="translate(1 1)" strokeWidth="2" fill="none" fillRule="evenodd">
      <circle strokeOpacity="0.5" cx="18" cy="18" r="18" />
      <path d="M36 18c0-9.94-8.06-18-18-18">
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 18 18"
          to="360 18 18"
          dur="1s"
          repeatCount="indefinite"
        />
      </path>
    </g>
  </svg>
);

function getLanguage(log) {
  const header = log.request.log.entries[0].request.headers.find(
    e => e.name.toLowerCase() === 'user-agent',
  );
  if (header) return header.value;
  return '-';
}

function checkFreshness(existingLogs, incomingLogs) {
  if (
    (existingLogs.length && existingLogs[0]._id !== incomingLogs[0]._id) ||
    !existingLogs.length
  ) {
    return incomingLogs;
  }
  throw new Error('Requested logs are not up-to-date.');
}

class Logs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      logs: [],
    };

    this.renderSelect = this.renderSelect.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.visitLogItem = this.visitLogItem.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  componentDidUpdate(prevProps) {
    // Refresh if the group has changed
    if (this.props.group !== prevProps.group) {
      // Setting logs to [] means we show the loading icon
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ logs: [] });
      this.refresh();
    }

    // Refresh if the result has changed (this means has "try it now" been called?)
    if (this.props.result !== prevProps.result) {
      this.refresh();
    }
  }

  onSelect(event) {
    this.changeGroup(event.target.value);
  }

  getData() {
    const { query, baseUrl, group } = this.props;
    this.setState({ loading: true });

    const reqUrl = `${baseUrl}/api/logs?${querystring.stringify(
      Object.assign({}, query, { id: group || null, limit: 5, page: 0 }),
    )}`;

    return retry(
      async () => {
        const res = await fetch(reqUrl);
        const parsedLogs = await this.handleData(res);
        return checkFreshness(this.state.logs, parsedLogs);
      },
      { minTimeout: 50 },
    );
  }

  async handleData(res) {
    this.setState({ loading: false });
    if (res.status === 200) {
      return res.json();
    }
    throw new Error(`Failed to fetch logs`);
  }

  changeGroup(group) {
    this.props.changeGroup(group);
  }

  refresh() {
    this.getData()
      .then(logs => {
        this.setState({ logs });
      })
      .catch(() => {
        // TODO HANDLE ERROR
      });
  }

  visitLogItem(log) {
    const { baseUrl } = this.props;
    window.open(`${baseUrl}logs/${log._id}`);
  }

  renderLogs() {
    const { logs } = this.state;

    return logs.map(log => {
      const entry = log.request.log.entries[0];
      /* eslint-disable react/jsx-no-bind */
      return (
        <tr onClick={this.visitLogItem.bind(this, log)} key={log._id}>
          <td>{entry.request.method}</td>
          <td>{entry.response.status}</td>
          <td>{entry.request.url}</td>
          <td>{log.group.label}</td>
          <td>{getLanguage(log)}</td>
          <td>{new Date(log.createdAt).toLocaleString()}</td>
        </tr>
      );
    });
  }

  static renderOption(item) {
    return (
      <option key={item.id} value={item.id}>
        {item.name}
      </option>
    );
  }

  renderSelect() {
    const { groups, group } = this.props;

    if (groups && groups.length > 1) {
      return (
        <select value={group} onChange={this.onSelect}>
          {groups.map(Logs.renderOption)}
        </select>
      );
    }
    return null;
  }

  renderTable() {
    const { loading, logs } = this.state;
    if (loading && logs.length === 0) {
      return (
        <div className="loading-container">
          <LoadingSvg className="normal" />
        </div>
      );
    }

    if (!logs.length) {
      return (
        <div className="logs-empty">
          <p>No Logs</p>
        </div>
      );
    }

    return (
      <table className="table">
        <thead>
          <tr>
            <th className="method">Method</th>
            <th className="status">Status</th>
            <th className="url">URL</th>
            <th className="group">Project</th>
            <th className="useragent">User Agent</th>
            <th className="time">Time</th>
          </tr>
        </thead>
        <tbody>{this.renderLogs()}</tbody>
      </table>
    );
  }

  render() {
    const { query, baseUrl, group } = this.props;
    if (!group) return null;

    const url = `${baseUrl}/logs?${querystring.stringify(Object.assign({}, query, { id: group }))}`;

    return (
      <div className="logs">
        <div className="log-header">
          <h3>Logs</h3>
          <div className="select-container">
            <div>
              <a href={url} target="_blank" rel="noopener noreferrer">
                View More
              </a>
              {this.renderSelect()}
            </div>
          </div>
        </div>
        <div className="logs-list">{this.renderTable()}</div>
      </div>
    );
  }
}

Logs.propTypes = {
  query: PropTypes.shape({}).isRequired,
  baseUrl: PropTypes.string.isRequired,
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  changeGroup: PropTypes.func.isRequired,
  result: PropTypes.shape({}),
};

Logs.defaultProps = {
  group: '',
  groups: [],
  result: null,
};

module.exports = Logs;
module.exports.Logs = Logs;
