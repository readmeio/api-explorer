import Callout from './callout';
import Html from './html';
import Textarea from './textarea';
import { Code, BlockCode } from './code';
import Image from './image';
import Embed from './embed';
import Parameters from './parameters';
import ApiHeader from './api-header';


const Loop = ({content, column}) => {
  {
    (content)  && (
      for (block in content) {
        {
          (block.type === 'textarea') && (
            <Textarea/>
           )
        }

        {
          (block.type === 'code') && (
            <Code/>
            <BlockCode dark={column === 'right'} />
          )
        }

        {
          (block.type === 'html') && (
            <Html/>
          )
        }

        {
          (block.type === 'image')  && (
            <Image/>
          )
        }

        {
          (block.type === 'embed') && (
            <Embed/>
          )
        }

        {
          (block.type === 'parameters') && (
            <Parameters/>
          )
        }

        {
          (block.type === 'callout') && (
            <Callout/>
          )
        }

        {
          (block.type === 'api-header') && (
            <ApiHeader/>
          )
        }
      }
    )
  }
}

const Opts = ({opts, content}) => {
  {
    (opts && opts.isThreeColumn) && (
      (opts.isThreeColumn === true)  && (
          <div className="hub-reference-section">

            <div className="hub-reference-left">
              <div className="content-body" dangerouslySetInnerHTML={Loop(content.left, 'left')}>
              </div>
            </div>

            <div className="hub-reference-right">
              <div className="content-body" dangerouslySetInnerHTML={Loop(content.right, 'right')}>
              </div>
            </div>
          </div>
      )
      else {
        Loop(content[opts.isThreeColumn])
      }
    }
    else {
      Loop(content)
    }
    )
  }
};

module.exports= {
  Opts,
  Loop
}
