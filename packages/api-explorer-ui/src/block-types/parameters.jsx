const React = require('react');
// import Marked from '../lib/marked';

const Parameters = ({block}) => {
  const columns= block.data.cols;
  const rows= block.data.rows;
  return (
    <div className="magic-block-parameters">
      <div className="block-parameters-table">
        <div className="table">
          {
            (block.data.data['h-0'] || block.data.data['h-1']) && (
              <div className="tr">
                {columns.map((item, c) => (
                  <div className="th">
                    {block.data.data['h-' + c]}
                  </div>
                ))}
              </div>
            )
          }

          {
            rows.map((item, r) => (
            <div className="tr">
              {columns.map((ele, c) => (
                <div className="td" >
                  {block.data.data[r + '-' + c] || ''}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

module.exports = Parameters;
