const React = require('react');
const { shallow } = require('enzyme');
const Image = require('../../src/block-types/Image');

describe('Image', () => {
  test('Image has a tag with property href set to url', () => {
    const block = {
      type: 'image',
      data: {
        images: [
          {
            image: [
              'https://files.readme.io/924824e-fullsizeoutput_314.jpeg',
              'fullsizeoutput_314.jpeg',
              640,
              1136,
              '#c8b396',
            ],
          },
        ],
      },
      sidebar: undefined,
    };
    const imageInput = shallow(<Image block={block} />);

    expect(imageInput.find('a').prop('href')).toBe(
      'https://files.readme.io/924824e-fullsizeoutput_314.jpeg',
    );
  });
  test('Image will render caption if given in props', () => {
    const block = {
      type: 'image',
      data: {
        images: [
          {
            image: [
              'https://files.readme.io/924824e-fullsizeoutput_314.jpeg',
              'fullsizeoutput_314.jpeg',
              640,
              1136,
              '#c8b396',
            ],
            caption: 'doggo',
          },
        ],
      },
      sidebar: undefined,
    };

    const imageInput = shallow(<Image block={block} />);

    expect(
      imageInput
        .find('figcaption')
        .render()
        .text(),
    ).toBe('doggo');
  });
});
