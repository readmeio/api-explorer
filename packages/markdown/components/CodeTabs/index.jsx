// There's a bug in jsdom where Jest spits out heaps of errors from it not being able to interpret
// this file, so let's not include this when running tests since we aren't doing visual testing
// anyways.
// https://github.com/jsdom/jsdom/issues/217
/* istanbul ignore next */
if (process.env.NODE_ENV !== 'test') {
  // eslint-disable-next-line global-require
  require('./style.scss');
}

const React = require('react');
const PropTypes = require('prop-types');

const CodeTabs = props => {
  const { attributes, children } = props;

  function handleClick({ target }, index) {
    const $wrap = target.closest('.CodeTabs');
    $wrap
      .querySelectorAll('.CodeTabs_active')
      .forEach(el => el.classList.remove('CodeTabs_active'));
    $wrap.classList.remove('CodeTabs_initial');

    const codeblocks = $wrap.querySelectorAll('pre');
    codeblocks[index].classList.add('CodeTabs_active');

    target.classList.add('CodeTabs_active');
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...attributes} className="CodeTabs CodeTabs_initial">
      <div className="CodeTabs-toolbar">
        {children.map(({ props: pre }, i) => {
          const { meta, lang } = pre.children[0].props;
          return (
            <button key={i} onClick={e => handleClick(e, i)} type="button">
              {meta || `(${lang || 'plaintext'})`}
            </button>
          );
        })}
      </div>
      <div className="CodeTabs-inner">{children}</div>
    </div>
  );
};

CodeTabs.propTypes = {
  attributes: PropTypes.shape({}),
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
};

CodeTabs.defaultProps = {
  attributes: null,
};

module.exports = (/* sanitizeSchema */) => {
  return CodeTabs;
};
