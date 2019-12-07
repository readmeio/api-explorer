const React = require('react');
const PropTypes = require('prop-types');

require('./style.scss');

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
    <div {...attributes} className="CodeTabs CodeTabs_initial">
      <div className="CodeTabs-toolbar">
        {children.map(({ props: pre }, i) => {
          const { meta, lang } = pre.children[0].props;
          return (
            <button type="button" onClick={e => handleClick(e, i)}>
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
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
  attributes: PropTypes.shape({}),
};

CodeTabs.defaultProps = {
  attributes: null,
};

module.exports = (/* sanitizeSchema */) => {
  return CodeTabs;
};
