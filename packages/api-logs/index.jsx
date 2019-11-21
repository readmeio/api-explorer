const React = require('react');
const PropTypes = require('prop-types');
const querystring = require('querystring');
const retry = require('async-retry');

const LoadingSvg = props => (
  <svg
    height="38"
    stroke="#2283c9"
    viewBox="0 0 38 38"
    width="38"
    xmlns="http://www.w3.org/2000/svg"
    // eslint-disable-next-line react/jsx-props-no-spreading
    {...props}
  >
    <g fill="none" fillRule="evenodd" strokeWidth="2" transform="translate(1 1)">
      <circle cx="18" cy="18" r="18" strokeOpacity="0.5" />
      <path d="M36 18c0-9.94-8.06-18-18-18">
        <animateTransform
          attributeName="transform"
          dur="1s"
          from="0 18 18"
          repeatCount="indefinite"
          to="360 18 18"
          type="rotate"
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
    (!existingLogs.length && incomingLogs.length) ||
    (existingLogs.length && incomingLogs.length && existingLogs[0]._id !== incomingLogs[0]._id)
  ) {
    return incomingLogs;
  }
  throw new Error('Requested logs are not up-to-date.');
}

function handleResponse(res) {
  if (res.status === 200) {
    return res.json();
  }
  throw new Error('Failed to fetch logs');
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
    this.getLogs();
  }

  componentDidUpdate(prevProps) {
    // Refresh if the group has changed
    if (this.props.group !== prevProps.group) {
      // Setting logs to [] means we show the loading icon
      this.setState({ logs: [] });
      this.getLogs();
    }

    // Refresh if the result has changed (this means has "try it now" been called?)
    if (this.props.result !== prevProps.result) {
      this.iterativeGetLogs();
    }
  }

  onSelect(event) {
    this.changeGroup(event.target.value, event.target.options[event.target.selectedIndex].text);
  }

  async getLogs(iterative) {
    let logs;

    try {
      const reqUrl = this.buildLogRequest();
      const res = await fetch(reqUrl);
      logs = await handleResponse(res);
    } catch (e) {
      // TODO Many Errors! Handle it!
    }

    if (!iterative) {
      this.setState({ loading: false });
    }

    if (!iterative && logs && logs.length) {
      this.setState({ logs });
    }
    return logs;
  }

  buildLogRequest() {
    const { query, baseUrl, group } = this.props;
    this.setState({ loading: true });

    return `${baseUrl}/api/logs?${querystring.stringify({
      ...query,
      id: group || null,
      limit: 5,
      page: 0,
    })}`;
  }

  async iterativeGetLogs() {
    try {
      const logs = await retry(
        async () => {
          const parsedLogs = await this.getLogs(true);
          return checkFreshness(this.state.logs, parsedLogs);
        },
        { retries: 6, minTimeout: 50 },
      );
      this.setState({ logs });
    } catch (e) {
      // TODO Many Errors! Handle it!
    }

    this.setState({ loading: false });
  }

  /**
   * @param {string} groupId
   * @param {string} groupName
   */
  changeGroup(groupId, groupName) {
    this.props.changeGroup(groupId, groupName);
  }

  visitLogItem(log) {
    const { baseUrl } = this.props;
    window.open(`${baseUrl}logs/${log._id}`);
  }

  renderLogs() {
    const { logs } = this.state;

    return logs.map(log => {
      const entry = log.request.log.entries[0];
      return (
        <tr key={log._id} onClick={this.visitLogItem.bind(this, log)}>
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
        <select onChange={this.onSelect} value={group}>
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

    const url = `${baseUrl}/logs?${querystring.stringify({ ...query, id: group })}`;

    return (
      <div className="logs">
        <div className="log-header">
          <h3>Logs</h3>
          <div className="select-container">
            <div>
              <a href={url} rel="noopener noreferrer" target="_blank">
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
  baseUrl: PropTypes.string.isRequired,
  changeGroup: PropTypes.func.isRequired,
  group: PropTypes.string,
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string,
      name: PropTypes.string,
    }),
  ),
  query: PropTypes.shape({}).isRequired,
  result: PropTypes.shape({}),
};

Logs.defaultProps = {
  group: '',
  groups: [],
  result: null,
};

module.exports = Logs;
module.exports.Logs = Logs;
module.exports.checkFreshness = checkFreshness;
module.exports.handleResponse = handleResponse;
