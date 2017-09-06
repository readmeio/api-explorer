import Marked from '../lib/marked';

const Image = ({block}) => {
  for (image in block.data.images) {
    const imageClass = image.sizing ? image.sizing : 'smart';
    const border =  image.border ? image.border : '';

    {
      (image && image.image && image.image.length)  && (
          <figure>
            <a className={`block-display-image-parent block-display-image-size-${imageClass}${border}`} href={image.image[0]}>
             <img src={image.image[0]} alt={image.caption}/>
            </a>
          </figure>

          {
            (image.caption) && (
              <figcaption dangerouslySetInnerHTML={Marked(image.caption)}></figcaption>
            )
          }
      )
    }
  }
};

module.exports = Image;
