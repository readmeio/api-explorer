const HTML = (block) => {
  <div className="magic-block-html" dangerouslySetInnerHTML={block.data.html}>
  </div>
};

module.exports = HTML;
