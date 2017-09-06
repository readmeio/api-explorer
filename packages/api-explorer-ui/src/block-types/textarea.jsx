import Marked from '../marked';

const Textarea = ({block}) => {
  <div className="magic-block-textarea">
    (block.text) && (
      {
        Marked(block.text)
      }
    )
  </div>
}

module.exports = Textarea;
