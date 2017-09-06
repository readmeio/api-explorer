const Embed = (block) => {
  return (
    <div className="magic-block-embed">
      if (block.data.html) {
       // dangerouslySetInnerHTML where?
      }
      else if (block.data.iframe) {
        return (
          <iframe className="media-iframe" src=`${block.data.url}` width={`${block.data.width}` || "100%"} height={`${block.data.height}` || "300px"}>
          </iframe>
        )
      }
      else {
        return (
          <strong>
            if (block.data.favicon){
              return (
                <a href=`${block.data.url}` target="_new">
                  {block.data.title || block.data.url}
                  <img src=`${block.data.favicon}` className="favicon"/>
                </a>
              )
            }
          </strong>
        )
      }
    </div>
  )
};

module.exports=Embed;
