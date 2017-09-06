const Image = (block) => {
  for (image in block.data.images) {
    const imageClass = image.sizing ? image.sizing : 'smart';
    const border =  image.border ? image.border : '';

    if (image && image.image && image.image.length) {
      return (
        <figure>
          <a className=`block-display-image-parent block-display-image-size-${imageClass}${border}` href={image.image[0]}>
            <img src={image.image[0]} alt={image.caption}/>
          </a>
        </figure>
      )
      //if block with marked?
    }
  }
};

module.exports = Image;
