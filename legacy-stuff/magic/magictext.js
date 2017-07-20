const _ = require('lodash');

// TODO2: This shouldn't be separate from the other parseBlocks
exports.parseBlocks = function (str, addTextareas) {
  if (!str) str = '';
  let block = false;
  const blocks = [];
  let previous = false;
  let sectionCount = 0;
  _.each(str.split(/\n?(\[block:[-a-z]+\]|\[\/block\])\n?/), (v) => {
    const check = v.match(/^(\[block:([-a-z]+)\]|\[\/block\])$/);

    if (check) {
      if (check[2]) {
        block = check[2];
      } else {
        block = false;
      }
    } else if (v.trim().length) {
      if (!block) {
        blocks.push({
          type: 'textarea',
          text: v,
        });
        block = 'textarea';
      } else if (block === 'textarea') {
        const j = JSON.parse(v);
        blocks.push({
          type: 'textarea',
          text: j.text,
          sidebar: j.sidebar,
        });
      } else {
        if (addTextareas) {
            // Everything should have a textarea between it!
          if (previous && previous !== 'textarea' && block !== 'textarea') {
            blocks.push({
              type: 'textarea',
              text: '',
            });
          }
        }

        const j = JSON.parse(v);
        blocks.push({
          type: block,
          data: j,
          sidebar: j.sidebar,
        });
      }
      previous = block;
      sectionCount += 1;
    }
  });

  if (addTextareas) {
    if ((previous && previous !== 'textarea') || !sectionCount) {
      blocks.push({
        type: 'textarea',
        text: '',
      });
    }
  }

  return blocks;
};
