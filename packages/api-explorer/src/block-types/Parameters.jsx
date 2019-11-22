const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('@readme/markdown');

const Parameters = ({ block, flags }) => {
  const columns = block.data.cols;
  const { rows } = block.data;

  function th() {
    const thCells = [];
    for (let c = 0; c < columns; c += 1) {
      thCells.push(
        <div key={c} className="th">
          {block.data.data[`h-${c}`]}
        </div>,
      );
    }
    return thCells;
  }

  function td(r) {
    const tdCells = [];

    for (let c = 0; c < columns; c += 1) {
      tdCells.push(
        <div key={c} className="td">
          {markdown(block.data.data[`${r}-${c}`] || '', flags)}
        </div>,
      );
    }
    return tdCells;
  }

  function tr() {
    const trCells = [];

    for (let r = 0; r < rows; r += 1) {
      trCells.push(
        <div key={r} className="tr">
          {td(r)}
        </div>,
      );
    }
    return trCells;
  }

  return (
    <div className="magic-block-parameters">
      <div className="block-parameters-table">
        <div className="table">
          {(block.data.data['h-0'] || block.data.data['h-1']) && <div className="tr">{th()}</div>}
          {tr()}
        </div>
      </div>
    </div>
  );
};

Parameters.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      cols: PropTypes.number.isRequired,
      data: PropTypes.object.isRequired,
      rows: PropTypes.number.isRequired,
    }),
  }).isRequired,
  flags: PropTypes.shape({}),
};

Parameters.defaultProps = {
  flags: {},
};

module.exports = Parameters;
