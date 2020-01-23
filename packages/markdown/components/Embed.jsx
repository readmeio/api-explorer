const React = require('react');
const propTypes = require('prop-types');

// const Embedly = require('embedly');
// const api =
//   process.env.NODE_ENV !== 'test'
//     ? new Embedly({ key: '' })
//     : {
//         extract: (opts, cb) => {
//           cb(false, [{ media: { html: 'testing' } }]);
//         },
//       };

class Embed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      embedly: false,
    };
  }

  // componentDidMount() {
  //   this.getEmbed();
  // }

  /* istanbul ignore next */
  // getGist(data) {
  //   const [, gistID] = this.props.url.match(
  //     /(?:gist.github.com\/(?:.[-_a-zA-Z0-9]+\/)?([-_a-zA-Z0-9]*)(?:\.git|\.js)?)/,
  //   );
  //   fetch(`https://api.github.com/gists/${gistID}`)
  //     .then(r => r.json())
  //     .then(gist => {
  //       const files = gist.files;
  //       const keys = Object.keys(files);
  //       const file = files[keys[0]];
  //       data.media.html = `<pre><code>${file.content}</code></pre>`;
  //       this.setState({ embedly: data });
  //     });
  // }

  /* istanbul ignore next */
  // getEmbed() {
  //   api.extract({ url: this.props.url }, (err, obj) => {
  //     if (err) {
  //       // eslint-disable-next-line no-console
  //       console.error(err);
  //       return err;
  //     }
  //     const result = obj[0];
  //     if (result.provider_display === 'gist.github.com') return this.getGist(result);
  //     return this.setState({ embedly: result });
  //   });
  // }

  render() {
    return (
      <div className="embed">
        <div
          className="embed-media"
          dangerouslySetInnerHTML={{ __html: this.props.html }}
          // dangerouslySetInnerHTML={
          //   (typeof this.state.embedly === 'object' &&
          //     'media' in this.state.embedly &&
          //     'html' in this.state.embedly.media && { __html: this.state.embedly.media.html }) || {
          //     __html: this.state.embedly.error_message,
          //   } || {
          //     __html: 'Loading...',
          //   }
          // }
        ></div>
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
