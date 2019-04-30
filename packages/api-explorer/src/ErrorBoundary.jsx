import {FormattedMessage} from 'react-intl';

const React = require('react');
const PropTypes = require('prop-types');

const BoundaryStackTrace = require('./BoundaryStackTrace');

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: false };
  }

  componentDidCatch(error, info) {
    this.setState({ error, info });
    // TODO add bugsnag here?
    // You can also log the error to an error reporting service
    // logErrorToMyService(error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{ paddingLeft: '2%', width: '75%' }}>
          <h3>
            <FormattedMessage
              id="error.explorer.render"
              defaultMessage="There was an error rendering the API Explorer. If you are the owner of this project please contact {address} with the following error"
              values={{
                address: <a href="mailto:support@mia-platform.eu">support@mia-platform.eu</a>,
              }}
            />
          </h3>
          <BoundaryStackTrace error={this.state.error} info={this.state.info} />
        </div>
      );
    }
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

module.exports = ErrorBoundary;
