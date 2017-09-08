const React = require('react');
const PropTypes = require('prop-types');

// import Marked from '../lib/marked';

const ImageBlock = ({ image }) => {
  const imageClass = image.sizing ? image.sizing : 'smart';
  const border = image.border ? image.border : '';

  return (
    <div>
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
              { (image.caption) && (<figcaption> { image.caption } </figcaption>)}

            </div>
          )
        }
    </div>
  );
};

const ImagesBlock = ({ block }) => {
  const myImages = block.data.images.map((image) => {
    return <ImageBlock image={image} />;
  });

  return (
    <div> { myImages } </div>
  );
};

ImagesBlock.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      images: PropTypes.array.isRequired,
    }),
  }).isRequired,
};

ImageBlock.propTypes = {
  image: PropTypes.shape({
    sizing: PropTypes.string.isRequired,
    border: PropTypes.string.isRequired,
    image: PropTypes.array.isRequired,
    caption: PropTypes.string.isRequired,
  }).isRequired,
};


module.exports = ImagesBlock;
