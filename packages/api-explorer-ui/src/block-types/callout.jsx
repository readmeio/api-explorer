const CallOut = (block) => {
  const c = block.data.title ? '' : 'no-title';

  return (
    <div className=`magic-block-callout type-${block.data/type} ${c} `>
      if (block.data.title) {
        <h3>
          if (block.data.type ==='info') {
            return <i className="fa fa-info-circle" title="Info"></i>
          }
          if (block.data.type ==='warning') {
            return <i className="fa fa-exclamation-circle" title="Warning"></i>
          }
          if (block.data.type ==='danger') {
            return <i className="fa fa-exclamation-triangle" title="Danger"></i>
          }
          if (block.data.type ==='success') {
            return <i className="fa fa-check-square" title="Success"></i>
          }
          dangerouslySetInnerHTML={block.data.title}
        </h3>

      if (!block.data.title) {
        <span className="noTitleIcon">
          if (block.data.type ==='info') {
            return <i className="fa fa-info-circle" title="Info"></i>
          }
          if (block.data.type ==='warning') {
            return <i className="fa fa-exclamation-circle" title="Warning"></i>
          }
          if (block.data.type ==='danger') {
            return <i className="fa fa-exclamation-triangle" title="Danger"></i>
          }
          if (block.data.type ==='success') {
            return <i className="fa fa-check-square" title="Success"></i>
          }
        </span>
      }

      if (block.data && block.data.body) {
        return (
         <div className="callout-body">
  //!=marked??
         </div>
        )
      }



      }
    </div>
  )
};

module.exports = CallOut;
