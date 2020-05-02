/*
eslint-disable jsx-a11y/no-autofocus, jsx-a11y/no-noninteractive-tabindex, jsx-a11y/no-noninteractive-element-interactions, react/jsx-props-no-spreading
 */

const React = require('react');
const PropTypes = require('prop-types');

/**
 * A very simple, CSS-driven lightbox.
 * @todo currently, a new <Lightbox> instance is rendered for
 *       each individual image! We should refactor to this to
 *       use a single React portal component with public APIs.
 */
const Lightbox = ({ alt, close, opened, src }, ref) => (
  <span
    ref={ref}
    autoFocus={true}
    className="lightbox"
    onClick={() => close()}
    onKeyDown={this.handleKey}
    onScroll={e => opened && close(false)}
    open={opened}
    role="dialog"
    tabIndex={0}
  >
    <span className="lightbox-inner">
      <img {...this.props} alt={alt} className="lightbox-img" loading="lazy" src={src} title="Click to close..." />
    </span>
  </span>
);

Lightbox.propTypes = {
  alt: PropTypes.string,
  close: PropTypes.func,
  opened: PropTypes.bool,
  src: PropTypes.string,
};

module.exports = React.forwardRef(Lightbox);
