const { stringify, parse } = require('querystring');
const React = require('react');
const PropTypes = require('prop-types');
const { Button, Flex, Input, Select, Title } = require('@readme/ui/.bundles/es/ui/components');

const localDirectory = require('../swagger-files/directory.json');

class ApiList extends React.Component {
  constructor(props) {
    super(props);

    const qs = parse(document.location.search.replace('?', ''));

    this.state = {
      apis: localDirectory,
      selected: qs.selected || 'swagger-files/petstore.json',
      customUrl: qs.customUrl,
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
        })
      );

    this.props.fetchSwagger(this.state.selected);
  }

  componentDidUpdate(prevProps, prevState) {
    const { selected } = this.state;

    if (prevState.selected !== selected && selected !== 'enter-a-url') {
      this.props.fetchSwagger(selected);
      window.history.pushState('', '', `?${stringify({ selected })}`);
    }
  }

  changeApi(e) {
    this.setState({ selected: e.currentTarget.value, customUrl: false });
  }

  render() {
    const { apis, selected, customUrl } = this.state;

    const options = [{ label: 'Enter a URL', value: 'enter-a-url' }];

    if (selected && customUrl) {
      options.push({
        label: selected,
        disabled: true,
        value: selected,
      });
    }

    Object.keys(apis).forEach(name => {
      const api = apis[name];
      const preferred = api.preferred || Object.keys(api.versions)[0];

      options.push({
        label: name,
        value: api.versions[preferred].swaggerUrl,
      });
    });

    return (
      <Flex>
        <Title level={4}>
          Select an API:
          {selected === 'enter-a-url' ? (
            <form style={{ display: 'inline' }}>
              <Input name="selected" size="sm" type="url" />
              <Input name="customUrl" type="hidden" value="true" />
              <Button bem={{ slate: true }} size="sm" type="submit">
                Go
              </Button>
            </form>
          ) : (
            <React.Fragment>
              <Select onChange={this.changeApi} options={options} size="sm" value={selected} />
              &nbsp;
              <a href={selected}>View document</a>
            </React.Fragment>
          )}
        </Title>
      </Flex>
    );
  }
}

ApiList.propTypes = {
  fetchSwagger: PropTypes.func.isRequired,
};

module.exports = ApiList;
