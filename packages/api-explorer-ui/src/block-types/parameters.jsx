const React = require('react');
// import Marked from '../lib/marked';

const Parameters = ({block}) => {
  const columns= block.data.cols;
  const rows= block.data.rows;

  const Th = () => {
    const th = [];
    for (let c= 0; c < columns; c++) {
      th.push(<div className="th">
        {block.data.data['h-' + c]}
      </div>);
    }
    return th;
  };

  const Tr = () => {
    const  tr = [];
    const td = [];
    for (let r = 0; r < rows; r++) {
      tr.push (
        <div className="tr">
          {() => {
            for (let c = 0; c < columns; c++) {

              td.push(
                <div className="td" >
                  {block.data.data[r + '-' + c] || ''}
                </div>
              );
            }
          }}
        </div>
      );
    }
    return tr;
  };

  return (
    <div className="magic-block-parameters">
      <div className="block-parameters-table">
        <div className="table">
          {
            (block.data.data['h-0'] || block.data.data['h-1']) && (
              <div className="tr">
                {Th}
              </div>
            )
          }
          {Tr}

        </div>
      </div>
    </div>
  );
};

module.exports = Parameters;
