import React from 'react';

// Marks
import Bold from './bold';
import Code from './code';
import Italic from './italic';
import Underlined from './underlined';
import Deleted from './deleted';
import Added from './added';

const renderMark = (props, editor, next) => {
  switch (props.mark.type) {
    case 'bold': return Bold(props);
    case 'code': return Code(props);
    case 'italic': return Italic(props);
    case 'underlined': return Underlined(props);
    case 'deleted': return Deleted(props);
    case 'added': return Added(props);
    default: return next();
  }
};

export default renderMark;
