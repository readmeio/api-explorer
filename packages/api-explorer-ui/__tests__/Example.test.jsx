const React = require('react');
const { shallow } = require('enzyme');
const petstore = require('./fixtures/petstore/oas');

const Example = require('../src/Example');
const Oas = require('../src/lib/Oas');

const { Operation } = Oas;
const oas = new Oas(petstore);

const noResult = {
  result: null,
  operation: new Operation({}, '/pet', 'post'),
};

describe('no examples', () => {
  test('if endpoint does not have example ', () => {
    const noExample = shallow(<Example {...noResult} oas={oas} />);

    expect(noExample.containsMatchingElement(<div>Try the API to see Results</div>)).toEqual(true);
  });
});
