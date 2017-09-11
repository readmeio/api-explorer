const React = require('react');
const PropTypes = require('prop-types');

// import Marked from '../lib/marked';

const ImageBlock = ({ block }) => {
  const myImage = block.data.images.map((image, i) => {
    const imageClass = image.sizing ? image.sizing : 'smart';
    const border = image.border ? image.border : '';


    return (
      <div className="magic-block-image" key={i}>
        {
          (image && image.image && image.image.length) && (
            <div>
              <figure>
                <a
                  className={`block-display-image-parent block-display-image-size-${imageClass}${border}`}
                  href={image.image[0]}
                >
                  <img src={image.image[0]} alt={image.caption} />
                </a>
              </figure>
              { image.caption &&
                <figcaption>
                  {
                    // TODO add marked
                    image.caption
                  }
                </figcaption>}

            </div>
          )
        }
      </div>
    );
  });

  return (
    <div className="image"> { myImage } </div>
  );
};


ImageBlock.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      images: PropTypes.array.isRequired,
    }),
  }).isRequired,
};


module.exports = ImageBlock;
