const Embed = ({block}) => {
  return (
    <div className="magic-block-embed">
      (block.data.html) && (
        {block.data.html}
       // dangerouslySetInnerHTML?
      )
      (block.data.iframe) && (
          <iframe className="media-iframe" src={block.data.url} width={{block.data.width} || "100%"} height={{block.data.height} || "300px"}>
          </iframe>
      )
      else {
        return (
          <strong>
            (block.data.favicon) && (
                <a href={block.data.url} target="_new">
                  {block.data.title || block.data.url}
                  <img src={block.data.favicon} className="favicon"/>
                </a>
            )

          </strong>
        )
      }
    </div>
  )
};

module.exports=Embed;
