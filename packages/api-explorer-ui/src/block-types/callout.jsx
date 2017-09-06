import Marked from '../lib/marked';

const CallOut = ({block}) => {
  const c = block.data.title ? '' : 'no-title';

  return (
    <div className={`magic-block-callout type-${block.data/type} ${c} `}>
      {
        (block.data.title) && (
          <h3>
            {
              (block.data.type === 'info') && (
                <i className="fa fa-info-circle" title="Info"></i>
              )
            }

            {
              (block.data.type ==='warning') && (
                <i className="fa fa-exclamation-circle" title="Warning"></i>
              )
            }

            {
              (block.data.type ==='danger') && (
                <i className="fa fa-exclamation-triangle" title="Danger"></i>
              )
            }

            {
              (block.data.type ==='success') && (
                <i className="fa fa-check-square" title="Success"></i>
              )
            }

            {block.data.title}
          </h3>

          (!block.data.title) && (
            <span className="noTitleIcon">
              {
                (block.data.type ==='info') && (
                  <i className="fa fa-info-circle" title="Info"></i>
                )
              }

                  {
                    (block.data.type ==='warning') && (
                      <i className="fa fa-exclamation-circle" title="Warning"></i>
                    )
                  }

                  {
                    (block.data.type ==='danger') && (
                      <i className="fa fa-exclamation-triangle" title="Danger"></i>
                    )
                  }

                  {
                    (block.data.type ==='success') && (
                      <i className="fa fa-check-square" title="Success"></i>
                    )
                  }

            </span>
          )

          (block.data && block.data.body) && (
            <div className="callout-body" dangerouslySetInnerHTML={Marked(block.data.body)}></div>
          )
      }
    </div>
  )
};

module.exports = CallOut;
