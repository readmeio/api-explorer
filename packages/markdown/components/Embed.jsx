const React = require('react');
const propTypes = require('prop-types');

class Embed extends React.Component {
  render() {
    return (
      <div className="embed">
        <div className="embed-media" dangerouslySetInnerHTML={{ __html: this.props.html }}></div>
      </div>
    );
  }
}

Embed.propTypes = {
  children: propTypes.oneOfType([
    propTypes.string,
    propTypes.array,
    propTypes.shape({}),
    propTypes.element,
  ]),
  html: propTypes.string,
  url: propTypes.oneOfType([propTypes.string, propTypes.shape({})]),
};

module.exports = () => Embed;
