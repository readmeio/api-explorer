// import Marked from '../lib/marked';
const React = require('react');

const Textarea = ({block}) => {
  return (
    <div className="magic-block-textarea">
      {block.text}
    </div>
  );
}

module.exports = Textarea;
