const React = require('react');
const { mount } = require('enzyme');
const Oas = require('oas/tooling');
const createParams = require('../../src/Params');

const discriminators = require('../__fixtures__/polymorphism/discriminators.json');

const oas = new Oas(discriminators);

const props = {
  oas,
  onChange: () => {},
  onJsonChange: () => {},
  onModeChange: () => {},
  onSubmit: () => {},
  resetForm: () => {},
};

function chooseOption(selectElement, optionNumber) {
  const options = selectElement.find('option');
  options.forEach(option => {
    option.instance().selected = false;
  });

  options.at(optionNumber).instance().selected = true;

  selectElement.simulate('change');
}

describe('discriminator', () => {
  it('should render the discriminator with proper mapping options', async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/oneOfWithTopLevelDiscriminatorAndMapping', 'patch');
    const Params = createParams(oas, operation);
    const formData = {};

    const params = mount(
      <div>
        <Params {...props} formData={formData} oas={testOas} operation={operation} />
      </div>
    );

    // Find the select element mapped, don't find the unmapped strings
    expect(params.text()).toContain('Option One');
    expect(params.text()).toContain('Option Two');
    expect(params.text()).not.toContain('OptionOneNoDisc');
    expect(params.text()).not.toContain('OptionTwoNoDisc');

    // Find the first option's fields but not the second
    expect(params.text()).toContain('discrim');
    expect(params.text()).toContain('optionone');
    expect(params.text()).not.toContain('optiontwo');

    // Switch the select element to option two
    chooseOption(params.find('select'), 1);

    // Find the second option's fields but not the first
    expect(params.text()).toContain('discrim');
    expect(params.text()).toContain('optiontwo');
    expect(params.text()).not.toContain('optionone');
  });

  it('should render the discriminator with unmapped options', async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/oneOfWithTopLevelDiscriminatorNoMapping', 'patch');
    const Params = createParams(oas, operation);
    const formData = {};

    const params = mount(
      <div>
        <Params {...props} formData={formData} oas={testOas} operation={operation} />
      </div>
    );

    // Find the select element
    expect(params.text()).toContain('OptionOneNoDisc');
    expect(params.text()).toContain('OptionTwoNoDisc');

    // Find the first option's fields but not the second
    expect(params.text()).toContain('discrim');
    expect(params.text()).toContain('optionone');
    expect(params.text()).not.toContain('optiontwo');

    // Switch the select element to option two
    chooseOption(params.find('select'), 1);

    // Find the second option's fields but not the first
    expect(params.text()).toContain('discrim');
    expect(params.text()).toContain('optiontwo');
    expect(params.text()).not.toContain('optionone');
  });

  it('should render discriminator when embedded in an allOf', async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/pets', 'patch');
    const Params = createParams(oas, operation);
    const formData = {};

    const params = mount(
      <div>
        <Params {...props} formData={formData} oas={testOas} operation={operation} />
      </div>
    );

    // Find the select element
    expect(params.text()).toContain('Cat');
    expect(params.text()).toContain('Dog');

    // Find the first option's fields but not the second
    expect(params.text()).toContain('pet_type');
    expect(params.text()).toContain('hunts');
    expect(params.text()).not.toContain('bark');

    // Switch the select element to option two
    chooseOption(params.find('select#body-patchpets'), 1);

    // Find the second option's fields but not the first
    expect(params.text()).toContain('pet_type');
    expect(params.text()).toContain('bark');
    expect(params.text()).not.toContain('hunts');
  });

  it('should render discriminator when top level, out of an allOf', async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/oneof-allof-top-level-disc', 'patch');
    const Params = createParams(oas, operation);
    const formData = {};

    const params = mount(
      <div>
        <Params {...props} formData={formData} oas={testOas} operation={operation} />
      </div>
    );

    // Find the select element
    expect(params.text()).toContain('CatNoDisc');
    expect(params.text()).toContain('DogNoDisc');

    // Find the first option's fields but not the second
    expect(params.text()).toContain('pet_type');
    expect(params.text()).toContain('hunts');
    expect(params.text()).not.toContain('bark');

    // Switch the select element to option two
    chooseOption(params.find('select#body-patchoneofalloftopleveldisc'), 1);

    // Find the second option's fields but not the first
    expect(params.text()).toContain('pet_type');
    expect(params.text()).toContain('bark');
    expect(params.text()).not.toContain('hunts');
  });

  it("should render discriminator when there's a one of in a one of", async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/anything/nested-one-of-object-with-nested-one-of', 'patch');
    const Params = createParams(oas, operation);
    const formData = {};

    const params = mount(
      <div>
        <Params {...props} formData={formData} oas={testOas} operation={operation} />
      </div>
    );

    const initialParamsText = params.text();
    // Find the first oneOf select element
    expect(initialParamsText).toContain('First type of object');
    expect(initialParamsText).toContain('Second type of object');
    expect(initialParamsText).toContain('Option 3');

    chooseOption(params.find('select#body-patchanythingnestedoneofobjectwithnestedoneof_config__oneof_select'), 2);

    const firstChangeParamsText = params.text();

    // Ensure the new select element exists
    expect(firstChangeParamsText).toContain('Cat');
    expect(firstChangeParamsText).toContain('Dog');

    // Find the first option's fields but not the second
    expect(firstChangeParamsText).toContain('pet_type');
    expect(firstChangeParamsText).toContain('hunts');
    expect(firstChangeParamsText).not.toContain('bark');

    chooseOption(params.find('select#body-patchanythingnestedoneofobjectwithnestedoneof_config'), 1);

    const secondChangeParamsText = params.text();
    // Find the second option's fields but not the first
    expect(secondChangeParamsText).toContain('pet_type');
    expect(secondChangeParamsText).toContain('bark');
    expect(secondChangeParamsText).not.toContain('hunts');
  });

  it('should ignore the discriminator if it is improperly placed', async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/oneOfWithImproperlyPlacedDiscriminator', 'patch');
    const Params = createParams(oas, operation);

    expect(() => {
      return mount(
        <div>
          <Params {...props} formData={{}} oas={testOas} operation={operation} />
        </div>
      );
    }).not.toThrow("Cannot use 'in' operator to search for '$ref' in null");
  });

  it('should not error if `formData` is undefined for whatever reason', async () => {
    const testOas = new Oas(discriminators);
    await testOas.dereference();
    const operation = testOas.operation('/potentially-undefined-formData', 'patch');
    const Params = createParams(oas, operation);

    expect(() => {
      return mount(
        <div>
          <Params {...props} formData={undefined} oas={testOas} operation={operation} />
        </div>
      );
    }).not.toThrow("Cannot read property 'event_type' of undefined");
  });
});
