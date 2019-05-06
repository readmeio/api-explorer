import React from 'react';
import { mount } from 'enzyme';

import Code from '../../src/block-types/Code';

const block = {
  type: 'code',
  sidebar: undefined,
  data: {
    codes: [
      {
        code: 'whjdwhjwejhkwhjk',
        language: 'text',
        status: 400,
        name: 'test',
      },
      {
        code: 'var a = 1',
        language: 'javascript',
      },
      {
        code: 'whjdwhjwejhkwhjk',
        language: 'text',
        name: 'test',
      },
    ],
  },
};

const block3 = {
  type: 'code',
  sidebar: undefined,
  data: {
    codes: [
      {
        code: 'whjdwhjwejhkwhjk',
        language: 'text',
        status: 400,
      },
    ],
  },
};

const badBlock = {
  type: 'code',
  sidebar: undefined,
  data: {
    codes: {
      code: {
        code: 'whjdwhjwejhkwhjk',
        language: 'text',
        status: 400,
      },
    },
  },
};

const block2 = {
  type: 'code',
  sidebar: undefined,
  data: {
    codes: [
      {
        code: 'var a = 1',
        language: 'javascript',
      },
    ],
  },
};

test('Code will render name if provided within em tag if codes has a status', () => {
  const codeInput = mount(<Code block={block} />);
  expect(codeInput.find('em').text()).toBe('test');
});

test('Code will render status code within em tag', () => {
  const codeInput = mount(<Code block={block3} />);
  expect(codeInput.find('em').text()).toBe('Bad Request');
});

test('If codes array is not passed as an array expect empty array', () => {
  const codeInput = mount(<Code block={badBlock} />);

  expect(codeInput.find('span').text()).toBe('');
});

test('Code will render language if name or status is not provided within a tag if codes has a status', () => {
  const codeInput = mount(<Code block={block2} />);
  expect(codeInput.find('a').text()).toBe('JavaScript');
});

test('Code will render label if provided within opts', () => {
  const codeInput = mount(<Code block={block} opts={{ label: 'label' }} />);
  expect(codeInput.find('label').text()).toBe('label');
});

test('Code should switch tabs', () => {
  const codeInput = mount(<Code block={block} opts={{}} />);
  const anchor = codeInput.find('li a').at(1);
  anchor.simulate('click');
  expect(anchor.render().hasClass('active')).toBe(true);
});

test('should uppercase known languages', () => {
  expect(
    mount(
      <Code
        block={{
          data: {
            codes: [
              {
                language: 'http',
                code: '',
              },
            ],
          },
        }}
      />,
    )
      .find('li a')
      .text(),
  ).toBe('HTTP');
});

test('should pass through unknown languages', () => {
  expect(
    mount(
      <Code
        block={{
          data: {
            codes: [
              {
                language: 'unknown-language-somehow',
                code: '',
              },
            ],
          },
        }}
      />,
    )
      .find('li a')
      .text(),
  ).toBe('unknown-language-somehow');
});
