const React = require('react');
const PropTypes = require('prop-types');
const querystring = require('querystring');
const retry = require('async-retry');

const { getHeaderValue, checkFreshness, handleResponse, getFormattedUserAgent } = require('./utils');
const { default: NodeSvg } = require('./assets/node-logo.svg');
const { default: PythonSvg } = require('./assets/python-logo.svg');
const { default: RubySvg } = require('./assets/ruby-logo.svg');
const { default: PhpSvg } = require('./assets/php-logo.svg');
const { default: ReadmeSvg } = require('./assets/readme-logo.svg');

const IconSvg = () => (
  <svg height="19" viewBox="0 0 24 19" width="24" xmlns="http://www.w3.org/2000/svg">
    <path d="M3.29102 8.82048C3.29102 8.43813 3.59388 8.12817 3.96749 8.12817H12.0851C12.4587 8.12817 12.7616 8.43813 12.7616 8.82048C12.7616 9.20283 12.4587 9.51279 12.0851 9.51279H3.96749C3.59388 9.51279 3.29102 9.20283 3.29102 8.82048Z" />
    <path d="M3.29102 3.5751C3.29102 3.16916 3.61256 2.84009 4.00921 2.84009C4.40587 2.84009 4.72741 3.16916 4.72741 3.5751C4.72741 3.98104 4.40587 4.31011 4.00921 4.31011C3.61256 4.31011 3.29102 3.98104 3.29102 3.5751Z" />
    <path d="M5.99707 3.5751C5.99707 3.16916 6.31862 2.84009 6.71527 2.84009C7.11192 2.84009 7.43347 3.16916 7.43347 3.5751C7.43347 3.98104 7.11192 4.31011 6.71527 4.31011C6.31862 4.31011 5.99707 3.98104 5.99707 3.5751Z" />
    <path d="M8.70361 3.5751C8.70361 3.16916 9.02516 2.84009 9.42181 2.84009C9.81846 2.84009 10.14 3.16916 10.14 3.5751C10.14 3.98104 9.81846 4.31011 9.42181 4.31011C9.02516 4.31011 8.70361 3.98104 8.70361 3.5751Z" />
    <path d="M3.29102 11.5893C3.29102 11.2069 3.59388 10.897 3.96749 10.897H14.791C15.1646 10.897 15.4675 11.2069 15.4675 11.5893C15.4675 11.9716 15.1646 12.2816 14.791 12.2816H3.96749C3.59388 12.2816 3.29102 11.9716 3.29102 11.5893Z" />
    <path d="M3.29102 14.3586C3.29102 13.9762 3.59388 13.6663 3.96749 13.6663H9.37925C9.75286 13.6663 10.0557 13.9762 10.0557 14.3586C10.0557 14.7409 9.75286 15.0509 9.37925 15.0509H3.96749C3.59388 15.0509 3.29102 14.7409 3.29102 14.3586Z" />
    <path
      clipRule="evenodd"
      d="M21.9895 1.70441H2.18145V16.4377H21.9895V1.70441ZM2.18145 0.0710449C1.3 0.0710449 0.585449 0.802327 0.585449 1.70441V16.4377C0.585449 17.3398 1.3 18.071 2.18145 18.071H21.9895C22.8709 18.071 23.5854 17.3398 23.5854 16.4377V1.70441C23.5854 0.802327 22.8709 0.0710449 21.9895 0.0710449H2.18145Z"
      fillRule="evenodd"
    />
  </svg>
);
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
    if (this.props.group) {
      this.getLogs();
    }
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
    this.changeGroup(event.target.value);
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
        { retries: 6, minTimeout: 50 }
      );
      this.setState({ logs });
    } catch (e) {
      // TODO Many Errors! Handle it!
    }

    this.setState({ loading: false });
  }

  changeGroup(group) {
    this.props.changeGroup(group);
  }

  visitLogItem(log) {
    const { baseUrl } = this.props;
    window.open(`${baseUrl}/logs/${log._id}`);
  }

  renderLogs() {
    const { logs } = this.state;

    return logs.map(log => {
      const userAgent = getHeaderValue(log.requestHeaders, 'user-agent');
      const formattedUserAgent = getFormattedUserAgent(userAgent) || '-';
      const userAgentIcon = Logs.getUserAgentIcon(formattedUserAgent);
      const timestamp = new Date(log.createdAt).toLocaleString();

      return (
        <tr key={log._id} onClick={this.visitLogItem.bind(this, log)}>
          <td>{log.method}</td>
          <td>{log.status}</td>
          <td>{log.url}</td>
          <td>{log.group.label}</td>
          <td>
            <span className="useragent">
              {userAgentIcon}
              {formattedUserAgent}
            </span>
          </td>
          <td>{timestamp}</td>
        </tr>
      );
    });
  }

  static getUserAgentIcon(name) {
    switch (name) {
      case 'node':
        return <NodeSvg />;
      case 'python':
        return <PythonSvg />;
      case 'php':
        return <PhpSvg />;
      case 'ruby':
        return <RubySvg />;
      case 'ReadMe API Explorer':
        return <ReadmeSvg />;
      default:
        return null;
    }
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
          <IconSvg />
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
            <th className="group">User</th>
            <th className="useragent">User Agent</th>
            <th className="time">Time</th>
          </tr>
        </thead>
        <tbody>{this.renderLogs()}</tbody>
      </table>
    );
  }

  render() {
    const { query, baseUrl, group, loginUrl } = this.props;
    if (!group) {
      return (
        <div className="logs">
          <div>
            <h3>Logs</h3>
          </div>
          <div>
            <div className="logs-login">
              <IconSvg />
              <p>Log in to view your API logs for this endpoint</p>
              <a className="logs-login-button" href={loginUrl}>
                Log In
              </a>
            </div>
          </div>
        </div>
      );
    }

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
    })
  ),
  loginUrl: PropTypes.string,
  query: PropTypes.shape({}).isRequired,
  result: PropTypes.shape({}),
};

Logs.defaultProps = {
  group: '',
  groups: [],
  loginUrl: 'https://dash.readme.com/login',
  result: null,
};

module.exports = Logs;
module.exports.Logs = Logs;
