const React = require('react');
const { shallow } = require('enzyme');
const { waitFor } = require('@testing-library/dom');
const extensions = require('@readme/oas-extensions');
const Oas = require('oas/tooling');

const petstore = require('./__fixtures__/petstore/oas.json');
const string = require('./__fixtures__/string/oas.json');
const exampleResults = require('./__fixtures__/example-results/oas.json');

const ResponseExample = require('../src/ResponseExample');
const ExampleTabs = require('../src/ExampleTabs');

const oas = new Oas(petstore);

const props = {
  oas,
  onChange: () => {},
  operation: oas.operation('/pet', 'post'),
  result: null,
};

test('should show no examples if endpoint does not have any', () => {
  const comp = shallow(<ResponseExample {...props} />);

  expect(comp.containsMatchingElement(<div>Try the API to see Results</div>)).toBe(true);
});

test('should check the operation level extensions first', () => {
  const operationExplorerEnabled = oas.operation('/pet/{petId}/uploadImage', 'post');
  operationExplorerEnabled.schema[extensions.EXPLORER_ENABLED] = true;

  const comp = shallow(
    <ResponseExample
      {...props}
      oas={new Oas({ ...petstore, [extensions.EXPLORER_ENABLED]: false })}
      operation={operationExplorerEnabled}
    />
  );
  expect(comp.containsMatchingElement(<div>Try the API to see Results</div>)).toBe(true);
});

test('should notify about no examples being available if explorer disabled', () => {
  const comp = shallow(
    <ResponseExample {...props} oas={new Oas({ ...petstore, [extensions.EXPLORER_ENABLED]: false })} />
  );

  expect(comp.containsMatchingElement(<div>No response examples available</div>)).toBe(true);
});

describe('has examples', () => {
  describe('from an openapi definition', () => {
    it('should show each example', () => {
      const exampleOas = new Oas(exampleResults);
      const comp = shallow(
        <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />
      );

      return waitFor(() => {
        comp.update();

        expect(comp.find(ExampleTabs).render().find('.tabber-tab').text().trim()).toStrictEqual(
          '200 OK 400 Bad Request Default'
        );

        expect(comp.find('pre')).toHaveLength(3);
      });
    });

    it('should display json viewer', () => {
      const exampleOas = new Oas(exampleResults);
      const comp = shallow(
        <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />
      );

      return waitFor(() => {
        comp.update();

        // Asserting all JSON examples are displayed with JSON viewer from the example oas.json
        expect(comp.find('pre').at(0).render().find('.react-json-view')).toHaveLength(1);
      });
    });

    it('should not fail to parse invalid json and instead show the standard syntax highlighter', () => {
      const exampleOas = new Oas(string);
      const comp = shallow(
        <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/format-uuid', 'get')} />
      );

      return waitFor(() => {
        comp.update();

        // Asserting that instead of failing with the invalid JSON we attempted to render, we fallback
        // to just rendering the string in our standard syntax highlighter.
        expect(comp.find('pre').at(0).render().find('.cm-number')).toHaveLength(4);
      });
    });

    it('should correctly highlight XML syntax', () => {
      const exampleOas = new Oas(exampleResults);
      const comp = shallow(
        <ResponseExample {...props} oas={exampleOas} operation={exampleOas.operation('/results', 'get')} />
      );

      return waitFor(() => {
        comp.update();

        // Asserting that there are XML tags
        expect(comp.find('pre').at(1).render().find('.cm-tag')).toHaveLength(25);
      });
    });

    it('should show select for multiple examples on a single media type', () => {
      const exampleOas = new Oas(exampleResults);
      const comp = shallow(
        <ResponseExample
          {...props}
          oas={exampleOas}
          operation={exampleOas.operation('/single-media-type-multiple-examples', 'get')}
        />
      );

      return waitFor(() => {
        comp.update();

        const html = comp.html();

        expect(html).not.toContain('>Response type');
        expect(html).toContain('>Choose an example');
      });
    });

    it('should not show a select if a media type has a single example', () => {
      const exampleOas = new Oas(exampleResults);
      const comp = shallow(
        <ResponseExample
          {...props}
          oas={exampleOas}
          operation={exampleOas.operation('/single-media-type-single-example', 'get')}
        />
      );

      return waitFor(() => {
        comp.update();

        expect(comp.html()).not.toContain('<select');
      });
    });
  });

  it('should correctly handle non-json legacy manual api examples', () => {
    const exampleResponses = [
      {
        status: 200,
        language: 'xml',
        code: '<?xml version="1.0" encoding="UTF-8"?><message>OK</message>',
        name: '',
      },
      {
        name: 'Invalid Credentials',
        status: 200,
        language: 'xml',
        code: '<?xml version="1.0" encoding="UTF-8"?><message>Invalid Credentials</message>',
      },
      {
        status: 404,
        language: 'xml',
        code: '<?xml version="1.0" encoding="UTF-8"?><detail>404 Erroror</detail>',
      },
    ];

    const comp = shallow(<ResponseExample {...props} exampleResponses={exampleResponses} />);

    const html = comp.html();

    expect(html).not.toContain('>Response type');
    expect(html).toContain('>Choose an example');
  });
});

describe('#setCurrentTab', () => {
  it('setCurrentTab should change state of currentTab', () => {
    const comp = shallow(<ResponseExample {...props} />);

    expect(comp.state('currentTab')).toBe(0);

    return waitFor(() => {
      comp.update();

      comp.instance().setCurrentTab(1);

      expect(comp.state('currentTab')).toBe(1);
    });
  });
});
