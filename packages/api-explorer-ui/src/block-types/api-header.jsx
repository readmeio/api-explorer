import uslug from 'uslug';

const ApiHeader = ({block}) => {
  return (
    <div className="magic-block-api-header">
      <h1 className="header-scroll is-api-header">
        <span id={uslug(block.data.title)}>
        </span>
        <div className="anchor waypoint" id={`section-${uslug(block.data.title)}`}>
        </div>
        {
          (block.data.type && block.data.type !== 'basic') && (
            <span className={`pg-type-big pg-type type-${uslug(block.data.type)}`}>
              {block.data.title}
            </span>
          )
        }
        <a className="fa fa-anchor" href={`#section-${uslug(block.data.title)}`}>
        </a>
      </h1>
    </div>
  )
};

module.exports = ApiHeader;
