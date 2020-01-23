const React = require('react');
const propTypes = require('prop-types');
const Embedly = require('embedly');

const api = new Embedly({ key: 'f2aa6fc3595946d0afc3d76cbbd25dc3' });

class Embed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      embedly: false,
    };
    this.getEmbed();
  }

  getGist(data) {
    const [, gistID] = this.props.url.match(
      /(?:gist.github.com\/(?:.[-_a-zA-Z0-9]+\/)?([-_a-zA-Z0-9]*)(?:\.git|\.js)?)/,
    );
    fetch(`https://api.github.com/gists/${gistID}`)
      .then(r => r.json())
      .then(gist => {
        const files = gist.files;
        const keys = Object.keys(files);
        const file = files[keys[0]];
        data.media.html = `<pre><code>${file.content}</code></pre>`;
        this.setState({ embedly: data });
      });
  }

  getEmbed() {
    api.extract({ url: this.props.url }, (err, obj) => {
      // eslint-disable-next-line no-console, no-bitwise
      if (err) return console.error(err) | err;
      const result = obj[0];
      if (result.provider_display === 'gist.github.com') return this.getGist(result);
      return this.setState({ embedly: result });
    });
  }

  render() {
    // const { children } = this.props;
    return (
      <div className="embed">
        <div
          className="embed-media"
          dangerouslySetInnerHTML={
            (typeof this.state.embedly === 'object' &&
              'media' in this.state.embedly && { __html: this.state.embedly.media.html }) || {
              __html: 'Loading...',
            }
          }
        ></div>
      </div>
    );
  }
}

Embed.propTypes = {
  children: propTypes.arrayOf(
    propTypes.string,
    propTypes.array,
    propTypes.object,
    propTypes.element,
  ),
  url: propTypes.oneOfType(propTypes.string, propTypes.shape({})),
};

module.exports = () => Embed;
