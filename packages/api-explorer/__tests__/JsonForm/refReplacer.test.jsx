import refReplacer from '../../src/JsonForm/refReplacer'

import anyOf from '../testdata/anyOf.json'
import anyOfExpected from '../testdata/anyOf.refReplacer.expected.json'
import simple from '../testdata/simple.json'
import simpleExpected from '../testdata/simple.refReplacer.expected.json'
import simple2 from '../testdata/simple2.json'
import simple2Expected from '../testdata/simple2.refReplacer.expected.json'
import simple3 from '../testdata/simple3.json'
import simple3Expected from '../testdata/simple3.refReplacer.expected.json'
import withNot from '../testdata/not.json'
import withNotExpected from '../testdata/not.refReplacer.expected.json'

describe('refReplacer', () => {
    it('anyOf', () => {
        expect(refReplacer(anyOf)).toEqual(anyOfExpected)
    })
    
    it('simple', () => {
        expect(refReplacer(simple)).toEqual(simpleExpected)
    })
    
    it('simple2', () => {
        expect(refReplacer(simple2)).toEqual(simple2Expected)
    })

    it('simple3', () => {
        expect(refReplacer(simple3)).toEqual(simple3Expected)
    })

    it('with not', () => {
        expect(refReplacer(withNot)).toEqual(withNotExpected)
    })
})