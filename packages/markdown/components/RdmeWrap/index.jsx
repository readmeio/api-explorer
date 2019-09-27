/* eslint-disable */
const React = require('react');
// const PropTypes = require('prop-types');

require('./style.scss');

const RdmeWrap = ({attributes, children}) => {
  function test({target}, index) {
    const $wrap = target.parentElement;
    $wrap
      .querySelectorAll('.RdmeWrap_active')
      .forEach(el => el.classList.remove('RdmeWrap_active'));
    $wrap.classList.remove('RdmeWrap_initial');

    const codeblocks = $wrap.querySelectorAll('pre');
    codeblocks[index].classList.add('RdmeWrap_active');
    
    target.classList.add('RdmeWrap_active');
  }
  return (<div {...attributes} className="RdmeWrap RdmeWrap_initial">
    {children.map((block, i) => {
      return <button onClick={e => test(e, i)}>Tab {i}</button>
    })}
    <div className="RdmeWrap-inner">
      {children}
    </div>
  </div>);
};

module.exports = sanitizeSchema => {
  // sanitizeSchema.attributes['rdme-wrap'] = ['icon', 'theme', 'title', 'value'];
  return RdmeWrap;
}