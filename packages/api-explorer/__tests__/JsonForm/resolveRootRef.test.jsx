import resolveRootRef from '../../src/JsonForm/resolveRootRef'
import ROOT_REF_SCHEMA from '../testdata/config-root-ref-and-nested.json'
import EXPECTED_ROOT_REF from '../testdata/config-root-ref-and-nested.resolveRootRef.expected.json'
import CIRCULAR_ROOT_SCHEMA from '../testdata/circular-on-root.json'
import MISSING_REFERENCE from '../testdata/missing-reference.json'

test('resolve correctly $ref on root', async () => {
  const resp = await resolveRootRef(ROOT_REF_SCHEMA)
  expect(resp).toEqual(EXPECTED_ROOT_REF)
})

test('circular on root throws error', async () => {
  await expect(() => resolveRootRef(CIRCULAR_ROOT_SCHEMA)).toThrowError(new Error('circular reference'))
})

test('missing reference on root throws error', async () => {
  await expect(() => resolveRootRef(MISSING_REFERENCE)).toThrowError(new Error('missing reference'))
})
