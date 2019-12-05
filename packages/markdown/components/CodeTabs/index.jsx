/* eslint-disable */
const React = require('react');

require('./style.scss');

const CodeTabs = ({ attributes, children }) => {
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
        {children.map((block, i) => {
          console.log(block)
          return <button onClick={e => handleClick(e, i)}>Tab {i}</button>;
        })}
      </div>
      <div className="CodeTabs-inner">{children}</div>
    </div>
  );
};

module.exports = sanitizeSchema => {
  sanitizeSchema.attributes['code-tabs'] = [];
  sanitizeSchema.attributes['code'] = ['lang', 'meta'];
  return CodeTabs;
};
