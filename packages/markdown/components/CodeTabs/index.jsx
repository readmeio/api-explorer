/* eslint-disable eqeqeq */
const React = require('react');
const PropTypes = require('prop-types');

const upper = require('@readme/syntax-highlighter/uppercase');

const CodeTabs = props => {
  const { attributes, children } = props;

  function handleClick({ target }, index) {
    const $wrap = target.closest('.CodeTabs');
    $wrap.querySelectorAll('.CodeTabs_active').forEach(el => el.classList.remove('CodeTabs_active'));
    $wrap.classList.remove('CodeTabs_initial');

    const codeblocks = $wrap.querySelectorAll('pre');
    codeblocks[index].classList.add('CodeTabs_active');

    target.classList.add('CodeTabs_active');
  }

  return (
    // eslint-disable-next-line react/jsx-props-no-spreading
    <div {...attributes} className="CodeTabs --CodeTabs_initial--">
      <div className="CodeTabs-toolbar">
        {children.map(({ props: pre }, i) => {
          const { meta, lang } = pre.children[0].props;
          /* istanbul ignore next */
          return (
            <button
              key={i}
              className={`${i == props.activeTab ? 'CodeTabs_active' : ''}`}
              onClick={e => handleClick(e, i)}
              type="button"
            >
              {meta || `${!lang ? 'Text' : upper(lang)}`}
            </button>
          );
        })}
      </div>
      <div className="CodeTabs-inner">
        {children.map((k, i) => (
          <pre key={i} className={`${i == props.activeTab ? 'CodeTabs_active' : ''}`}>
            {k.props.children[0]}
          </pre>
        ))}
      </div>
    </div>
  );
};

CodeTabs.propTypes = {
  activeTab: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  attributes: PropTypes.shape({}),
  children: PropTypes.arrayOf(PropTypes.any).isRequired,
};

CodeTabs.defaultProps = {
  // eslint-disable-next-line prettier/prettier
  activeTab: "0",
  attributes: null,
};

module.exports = (/* sanitizeSchema */) => {
  return CodeTabs;
};
