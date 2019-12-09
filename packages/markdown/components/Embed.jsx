const React = require('react');
const Embedly = require('embedly');

const { useState } = React;

const api = new Embedly({ key: 'f2aa6fc3595946d0afc3d76cbbd25dc3' });

class Embed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      test: false,
    };
  }

  componentWillMount() {
    this.getEmbed();
  }

  getGist(data) {
    const [, gist_id] = this.props.url.match(
      /(?:gist.github.com\/(?:.[-_a-zA-Z0-9]+\/)?([-_a-zA-Z0-9]*)(?:\.git|\.js)?)/,
    );
    console.log(`https://api.github.com/gists/${gist_id}`);
    fetch('https://api.github.com/gists/f852004d6d1510eec1f6')
      .then(r => r.json())
      .then(gist => {
        const files = gist.files;
        const keys = Object.keys(files);
        const file = files[keys[0]];
        data.media.html = `<pre><code>${file.content}</code></pre>`;
        this.setState({ test: data });
      });
  }

  getEmbed() {
    api.extract({ url: this.props.url }, (err, obj) => {
      if (err) return console.error(err);
      const result = obj[0];
      if (result.provider_display === 'gist.github.com') return this.getGist(result);
      this.setState({ test: obj[0] });
    });
  }

  render() {
    const { children } = this.props;
    return (
      <div className="embed">
        <div
          className="embed-media"
          dangerouslySetInnerHTML={
            (typeof this.state.test === 'object' &&
              'media' in this.state.test && { __html: this.state.test.media.html }) || {
              __html: 'Loading...',
            }
          }
        ></div>
      </div>
    );
  }
}

module.exports = () => Embed;
