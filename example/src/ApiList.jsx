const { stringify, parse } = require('querystring');
const React = require('react');
const PropTypes = require('prop-types');

const localDirectory = require('../swagger-files/directory.json');

class ApiList extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      apis: localDirectory,
      selected:
        parse(document.location.search.replace('?', '')).selected || 'swagger-files/petstore.json',
    };

    this.changeApi = this.changeApi.bind(this);
  }

  componentDidMount() {
    fetch('https://api.apis.guru/v2/list.json')
      .then(res => res.json())
      .then(apis =>
        this.setState(prevState => {
          return {
            apis: { ...prevState.apis, ...apis },
          };
        }),
      );

    this.props.fetchSwagger(this.state.selected);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selected } = this.state;

    if (prevState.selected !== selected) {
      this.props.fetchSwagger(selected);
      window.history.pushState('', '', `?${stringify({ selected })}`);
    }
  }

  changeApi(e) {
    this.setState({ selected: e.currentTarget.value });
  }

  render() {
    const { apis, selected } = this.state;

    return (
      <h3>
        Select an API:&nbsp;
        <select onChange={this.changeApi} value={selected}>
          {Object.keys(apis).map(name => {
            const api = apis[name];
            const preferred = api.preferred || Object.keys(api.versions)[0];
            return (
              <option key={name} value={api.versions[preferred].swaggerUrl}>
                {name.substring(0, 30)}
              </option>
            );
          })}
        </select>
      </h3>
    );
  }
}

ApiList.propTypes = {
  fetchSwagger: PropTypes.func.isRequired,
};

module.exports = ApiList;
