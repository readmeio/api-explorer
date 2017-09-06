const React = require('react');
const PropTypes = require('prop-types');
const classNames = require('classnames');
const SecurityInput = require('./SecurityInput');
const { Operation } = require('./lib/Oas');

function renderSecurities(operation) {
  const securityTypes = operation.prepareSecurity();
  return Object.keys(securityTypes).map((type) => {
    const securities = securityTypes[type];
    return (
      <span key={type}>
        <h3>{type} Auth</h3>
        <div className="pad">
          <section>
            {
              // https://github.com/readmeio/api-explorer/issues/20
              // (type === 'OAuth2' && securities.length > 1) && (
              //   <select>
              //     {
              //       securities.map(security =>
              //         <option key={security._key} value={security._key}>{security._key}</option>,
              //       )
              //     }
              //   </select>
              // )
            }
            {
              securities.map(security => (
                <SecurityInput
                  key={security._key}
                  scheme={security}
                  apiKey=""
                />),
              )
            }
          </section>
        </div>
      </span>
    );
  });
}

class AuthBox extends React.Component {
  constructor(props) {
    super(props);
    this.state = { open: false };

    this.toggle = this.toggle.bind(this);
  }
  toggle(e) {
    e.preventDefault();
    this.setState({ open: !this.state.open });
    // this.props.onChange({ header: { 'test': '111' } });
  }

  render() {
    const { operation } = this.props;

    if (!operation.hasAuth()) return null;

    return (
      <div className={classNames('hub-auth-dropdown', 'simple-dropdown', { open: this.state.open })}>
        {
          // eslint-disable-next-line jsx-a11y/anchor-has-content
          <a href="" className="icon icon-user-lock" onClick={this.toggle} />
        }
        <div className="nopad">
          <div className="triangle" />
          <div>{ renderSecurities(operation) }</div>
        </div>
      </div>
    );
  }

}

AuthBox.propTypes = {
  operation: PropTypes.instanceOf(Operation).isRequired,
};

module.exports = AuthBox;
