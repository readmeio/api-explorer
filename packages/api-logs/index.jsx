const React = require('react');
const PropTypes = require('prop-types');
const querystring = require('querystring');

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

class Logs extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      logs: [],
      group: getGroup(props.user),
      groups: props.user.keys && props.user.keys.map(key => ({ id: key.id, name: key.name })),
    };

    this.renderSelect = this.renderSelect.bind(this);
    this.onSelect = this.onSelect.bind(this);
    this.renderTable = this.renderTable.bind(this);
  }

  componentDidMount() {
    this.refresh();
  }

  onSelect(event) {
    this.setState({ group: event.target.value });
    this.refresh();
  }

  getData() {
    const { oas, operation, baseUrl } = this.props;
    const { group } = this.state;
    this.setState({ loading: true });

    const limit = 5;
    const page = 0;
    const { method } = operation;
    const url = `${oas.servers[0].url}${operation.path}`;
    const find = {
      limit,
      page,
      url,
      method,
    };
    if (group) {
      find.group = group;
    }

    const reqUrl = `${baseUrl}api/logs?${querystring.stringify(find)}`;

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

  refresh() {
    this.getData()
      .then(logs => {
        this.setState({ logs });
      })
      .catch(() => {
        // TODO HANDLE ERROR
      });
  }

  renderLogs() {
    const { logs } = this.state;

    return logs.map(log => {
      const entry = log.request.log.entries[0];
      return (
        <tr key={log._id}>
          <td>{entry.request.method}</td>
          <td>{entry.response.status}</td>
          <td>{entry.request.url}</td>
          <td>{log.group.label}</td>
          <td>{getLanguage(log)}</td>
          <td>{log.createdAt}</td>
        </tr>
      );
    });
  }

  static renderOption(item) {
    return <option value={item.id}>{item.name}</option>;
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
    const { loading } = this.state;
    if (loading) {
      return (
        <div className="loading-container">
          {React.createElement(LoadingSvg, { className: 'normal' })}
        </div>
      );
    }
    return (
      <table className="table">
        <thead>
          <tr>
            <th>Method</th>
            <th>Status</th>
            <th>URL</th>
            <th>Group</th>
            <th>Language</th>
            <th>Time</th>
          </tr>
        </thead>
        <tbody>{this.renderLogs()}</tbody>
      </table>
    );
  }

  render() {
    const { group } = this.state;

    if (!group) return null;

    return (
      <div className="logs">
        <div className="log-header">
          <h3>Logs</h3>
          <div className="select-container">{this.renderSelect()}</div>
        </div>
        <div className="logs-list">{this.renderTable()}</div>
      </div>
    );
  }
}

Logs.propTypes = {
  oas: PropTypes.shape({}).isRequired,
  operation: PropTypes.shape({}).isRequired,
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
