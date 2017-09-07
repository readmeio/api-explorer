const React = require('react');

const Embed = ({block}) => {
  return (
    <div className="magic-block-embed">
      {(()=> {
        if (block.data.html) {
          return <span dangerouslySetInnerHTML={{__html: block.data.html}}/>;
        } else if (block.data.iframe) {
          return (<iframe className="media-iframe" src={block.data.url} width={ block.data.width || '100%'} height={block.data.height || '300px'} />);
        } else {
          return (
            <strong>
              { (block.data.favicon) && <img src={block.data.favicon} className="favicon" /> }
              <a href={block.data.url} target="_new">{block.data.title || block.data.url}</a>
            </strong>
          )
        }
      })()}
    </div>
  );
};

module.exports=Embed;
