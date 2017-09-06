import callout from './callout';
import html from './html';

const Loop = (content, column) => {
  if(content) {
    for (block in content) {
      if(block.type === 'textarea') {

      }
      if(block.type === 'code') {
        code
        //block-code doesn't inherit from loop
      }
      if(block.type === 'html') {
        <html/> //?
      }
      if(block.type === 'image') {

      }
      if(block.type === 'embed') {

      }
      if(block.type === 'parameters') {

      }
      if(block.type === 'callout') {
        callout
      }
      if(block.type === 'api-header') {

      }
    }
  }
}

const Opts = () => {
  if(opts && opts.isThreeColumn) {
    if(opts.isThreeColumn === true) {
      return (
        <div className="hub-reference-section">

          <div className="hub-reference-left">
            <div className="content-body" dangerouslySetInnerHTML={Loop(content.left, 'left')}>
            </div>
          </div>

          <div className="hub-reference-right">
            <div className="content-body" dangerouslySetInnerHTML={Loop(content.right, 'right')}>
            </div>
          </div>
        </div>
      )
    }
    else {
      Loop(content[opts.isThreeColumn])
    }
  }
  else {
    Loop(content)
  }
};

module.exports= {
  Opts,
  Loop
}
