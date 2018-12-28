const React = require('react');
const PropTypes = require('prop-types');
const querystring = require('querystring');
const VisibilitySensor = require('react-visibility-sensor');
const EventsEmitter = require('events');

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

function getGroup(userData) {
  if (userData.keys && userData.keys[0].id) {
    return userData.keys[0].id;
  }

  if (userData.id) {
    return userData.id;
  }

  return undefined;
}

const emitter = new EventsEmitter();
let selectedGroup;

class Logs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      stale: false,
      logs: [],
      group: selectedGroup || getGroup(props.user),
      groups: props.user.keys && props.user.keys.map(key => ({ id: key.id, name: key.name })),
    };

    this.renderSelect = this.renderSelect.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.renderTable = this.renderTable.bind(this);
    this.visitLogItem = this.visitLogItem.bind(this);
    this.changeGroup = this.changeGroup.bind(this);
    this.onVisible = this.onVisible.bind(this);
  }

  componentDidMount() {
    const { group } = this.state;
    emitter.on('changeGroup', this.changeGroup);
    this.refresh(group);
  }

  componentWillUnmount() {
    emitter.removeListener('changeGroup', this.changeGroup);
  }

  onSelect(event) {
    emitter.emit('changeGroup', event.target.value);
    // this.changeGroup(event.target.value);
    this.refresh(event.target.value);
  }

  onVisible() {
    const { stale, group } = this.state;
    if (stale) {
      this.refresh(group);
    }
  }

  getData(group) {
    const { query, baseUrl } = this.props;
    this.setState({ loading: true });

    const reqUrl = `${baseUrl}api/logs?${querystring.stringify(
      Object.assign({}, query, { id: group || null, limit: 5, page: 0 }),
    )}`;

    return fetch(reqUrl).then(res => {
      return this.handleData(res);
    });
  }

  handleData(res) {
    this.setState({ loading: false });
    if (res.status === 200) {
      return res.json();
    }
    throw new Error(`Failed to fetch logs`);
  }

  changeGroup(group) {
    selectedGroup = group;
    this.setState({
      group,
      stale: true,
    });
  }

  refresh(group) {
    this.setState({
      stale: false,
    });
    this.getData(group)
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
    const { groups, group } = this.state;

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
    if (loading) {
      return (
        <div className="loading-container">
          {React.createElement(LoadingSvg, { className: 'normal' })}
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
    const { group } = this.state;
    const { query, baseUrl } = this.props;
    if (!group) return null;

    const url = `${baseUrl}logs?${querystring.stringify(Object.assign({}, query, { id: group }))}`;

    return (
      <VisibilitySensor onChange={this.onVisible}>
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
      </VisibilitySensor>
    );
  }
}

Logs.propTypes = {
  query: PropTypes.shape({}).isRequired,
  baseUrl: PropTypes.string.isRequired,
  user: PropTypes.shape({
    keys: PropTypes.array,
    id: PropTypes.string,
  }),
};

Logs.defaultProps = {
  user: {},
};

module.exports = Logs;
module.exports.Logs = Logs;
module.exports.LogsEmitter = emitter;
