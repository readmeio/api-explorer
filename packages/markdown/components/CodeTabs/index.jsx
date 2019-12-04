/* eslint-disable */
const React = require('react');

require('./style.scss');

const CodeTabs = ({ attributes, children }) => {
  function handleClick({ target }, index) {
    const $wrap = target.parentElement;
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
      {children.map((block, i) => {
        return <button onClick={e => handleClick(e, i)}>Tab {i}</button>;
      })}
      <div className="CodeTabs-inner">{children}</div>
    </div>
  );
};

module.exports = sanitizeSchema => {
  // sanitizeSchema.attributes['code-tabs'] = ['icon', 'theme', 'title', 'value'];
  return CodeTabs;
};
