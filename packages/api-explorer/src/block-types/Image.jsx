const React = require('react');
const PropTypes = require('prop-types');
const markdown = require('@readme/markdown-magic');

const ImageBlock = ({ block, flags }) => {
  const myImage = block.data.images.map((image, i) => {
    const imageClass = image.sizing ? image.sizing : 'smart';
    const border = image.border ? image.border : '';

    return (
      <div key={i} className="magic-block-image">
        {image && image.image && image.image.length && (
          <div>
            <figure>
              <a
                className={`block-display-image-parent block-display-image-size-${imageClass}${border}`}
                href={image.image[0]}
              >
                <img alt={image.caption} src={image.image[0]} />
              </a>
            </figure>
            {image.caption && <figcaption>{markdown(image.caption, flags)}</figcaption>}
          </div>
        )}
      </div>
    );
  });

  return <div className="image">{myImage}</div>;
};

ImageBlock.propTypes = {
  block: PropTypes.shape({
    data: PropTypes.shape({
      images: PropTypes.array.isRequired,
    }),
  }).isRequired,
  flags: PropTypes.shape({}),
};

ImageBlock.defaultProps = {
  flags: {},
};

module.exports = ImageBlock;
