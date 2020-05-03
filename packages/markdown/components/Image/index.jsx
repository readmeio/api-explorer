/* eslint-disable no-param-reassign, jsx-a11y/no-noninteractive-element-to-interactive-role, react/jsx-props-no-spreading, no-fallthrough */

const React = require('react');
const PropTypes = require('prop-types');
const Lightbox = require('./Lightbox');

class Image extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lightbox: false,
    };
    this.lightbox = React.createRef();

    this.toggle = this.toggle.bind(this);
    this.handleKey = this.handleKey.bind(this);

    this.isEmoji = props.className === 'emoji';
  }

  componentDidMount() {
    this.lightboxSetup();
  }

  toggle(toState) {
    if (this.props.className === 'emoji') return;

    if (typeof toState === 'undefined') toState = !this.state.lightbox;

    if (toState) this.lightboxSetup();

    this.setState({ lightbox: toState });
  }

  lightboxSetup() {
    const $el = this.lightbox.current;
    setTimeout(() => {
      $el.scrollTop = ($el.scrollHeight - $el.offsetHeight) / 2;
      this.setState({ lightbox: true });
    }, 0);
  }

  handleKey(e) {
    let { key, metaKey: cmd } = e;

    cmd = cmd ? 'cmd+' : '';
    key = `${cmd}${key.toLowerCase()}`;

    switch (key) {
      case 'ArrowDown':
      case 'ArrowUp':
        break;
      case 'cmd+.':
      case 'escape':
        // CLOSE
        this.toggle(false);
        break;
      case ' ':
      case 'enter':
        // OPEN
        if (!this.state.open) this.toggle(true);
        e.preventDefault();
      default:
    }
  }

  render() {
    const { alt } = this.props;
    if (this.isEmoji) {
      return <img {...this.props} alt={alt} loading="lazy" />;
    }
    return (
      <span className="img" onKeyDown={this.handleKey} role={'button'} tabIndex={0}>
        <img {...this.props} alt={alt} onClickCapture={e => this.toggle(true) | e.preventDefault()} />
        <Lightbox ref={this.lightbox} {...this.props} close={this.toggle} opened={this.state.lightbox} />
      </span>
    );
  }
}

Image.propTypes = {
  align: PropTypes.string,
  alt: PropTypes.string,
  caption: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  className: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
  height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  src: PropTypes.string.isRequired,
  title: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
};

Image.defaultProps = {
  align: '',
  alt: '',
  caption: '',
  height: 'auto',
  src: '',
  title: '',
  width: 'auto',
};

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes.img = ['className', 'title', 'alt', 'width', 'height', 'align', 'src', 'longDesc'];
  return Image;
};
