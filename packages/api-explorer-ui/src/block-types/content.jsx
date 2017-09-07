// import Callout from './callout';
// import Html from './html'
const React = require('react');
import Textarea from './textarea';
// import { Code, BlockCode } from './code';
// import Image from './image';
// import Embed from './embed';
// import Parameters from './parameters';
// import ApiHeader from './api-header';

const parseBlocks = require('../lib/parse-magic-blocks');

const Loop = ({ content }) => {
  const elements = content.map((block) => {
    switch(block.type) {
      case 'textarea':
        return <Textarea block={block} />;
    }
  });
  return (
    <div>
      { elements }
    </div>
  );
        // {
          // for (block in content) {
          // {
          //   (block.type === 'code') && (
          //     <Code/>
          //     <BlockCode dark={column === 'right'} />
          // )
          // }
          //
          // {
          //   (block.type === 'html') && (
          //     <Html/>
          //   )
          // }
          //
          // {
          //   (block.type === 'image')  && (
          //     <Image/>
          //   )
          // }
          //
          // {
          //   (block.type === 'embed') && (
          //     <Embed/>
          //   )
          // }
          //
          // {
          //   (block.type === 'parameters') && (
          //     <Parameters/>
          //   )
          // }
          //
          // {
          //   (block.type === 'callout') && (
          //     <Callout/>
          //   )
          // }
          //
          // {
          //   (block.type === 'api-header') && (
          //     <ApiHeader/>
          //   )
          // }
        // }
};

const Opts = (props) => {
  console.log(props)
  const { body } = props;
  const { isThreeColumn } = props['is-three-column'];

  const content = parseBlocks(body);
  console.log({ content });
    // magictext.parseBlocks(content)
    // [ { type: 'textarea', ]

    // if (isThreeColumn) {
    //   const section = { left: [], right: [] };
    //   locals.content.forEach((elem) => {
    //     if (elem.sidebar) {
    //       section.right.push(elem);
    //     } else {
    //       section.left.push(elem);
    //     }
    //   });
    //
    //   locals.content = section;
    // }

  // if (isThreeColumn) {
  //   return (
  //     <div className="hub-reference-section">
  //       <div className="hub-reference-left">
  //         <div className="content-body">
  //           <Loop content={content.left} column="left" />
  //         </div>
  //
  //         <div className="hub-reference-right">
  //           <div className="content-body">
  //             <Loop content={content.right} column="right" />
  //           </div>
  //         </div>
  //       </div>
  //     </div>
  //   );
  // }

  return <Loop content={content} />;
};

module.exports = Opts;
