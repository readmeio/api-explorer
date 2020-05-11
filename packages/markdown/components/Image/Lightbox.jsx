/* eslint-disable jsx-a11y/no-autofocus, jsx-a11y/no-noninteractive-tabindex, react/jsx-props-no-spreading */

const React = require('react');

/**
 * A very simple, CSS-driven lightbox.
 * @todo currently, a new <Lightbox> instance is rendered for
 *       each individual image! We should refactor to this to
 *       use a single React portal component with public APIs.
 */
// eslint-disable-next-line react/prop-types
const Lightbox = ({ alt, onScroll, opened, ...attr }, ref) => {
  return (
    <span
      ref={ref}
      autoFocus={true}
      className="lightbox"
      onScrollCapture={onScroll}
      open={opened}
      role="dialog"
      tabIndex={0}
    >
      <span className="lightbox-inner">
        <img {...attr} alt={alt} className="lightbox-img" loading="lazy" title="Click to close..." />
      </span>
    </span>
  );
};

// forwardRef render functions throws a warning with propTypes/defaultProps
/* Lightbox.propTypes = {
  alt: PropTypes.string,
  close: PropTypes.func,
  opened: PropTypes.bool,
  src: PropTypes.string,
}; */

module.exports = React.forwardRef(Lightbox);
