const React = require('react');
const { shallow } = require('enzyme');
const Parameters = require('../../src/block-types/Parameters');

describe('Parameters', () => {
  it('Parameters will render text in table', () => {
    const block = {
      type: 'parameters',
      sidebar: undefined,
      data: {
        cols: 1,
        rows: 1,
        data: {
          '0-0': 'arbitrary',
          'h-0': 'test',
        },
      },
    };

    const parametersInput = shallow(<Parameters block={block} />);
    expect(parametersInput.find('div.th').text()).toBe('test');
    expect(parametersInput.find('div.td').render().text()).toBe('arbitrary');
  });
});
