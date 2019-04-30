import {FormattedMessage} from 'react-intl';

const React = require('react');
const PropTypes = require('prop-types');

const BoundaryStackTrace = require('./BoundaryStackTrace');

class EndpointErrorBoundary extends React.Component {
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
        <div className="hub-reference-section">
          <div className="hub-reference-left" style={{ paddingLeft: '2%' }}>
            <h3>
              <FormattedMessage
                id="error.endpoint.render"
                message="There was an error rendering this endpoint. If you are the owner of this project please contact {address} with the following error"
                value={{
                  address: 'support@mia-platform.eu'
                }}
              />
            </h3>
            <BoundaryStackTrace error={this.state.error} info={this.state.info} />
          </div>
          <div className="hub-reference-right" />
        </div>
      );
    }
    return this.props.children;
  }
}

EndpointErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
};

module.exports = EndpointErrorBoundary;
