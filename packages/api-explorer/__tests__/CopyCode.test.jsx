import React from 'react'
import {mount} from 'enzyme'
import {IntlProvider} from 'react-intl'
import {CopyToClipboard} from 'react-copy-to-clipboard'

import CopyCode from '../src/components/CopyCode'
import CopyText from '../src/components/CopyText'

describe('CopyCode', () => {
  const props = {
    code: 'foo'
  }

  test('onCopy set copied false after 1 second', () => {
    jest.useFakeTimers()
    const element = mountCopyCode(props)
    element.find(CopyToClipboard).prop('onCopy')()
    jest.advanceTimersByTime(500)
    assertToBeCopied(element, {copied: true})
    jest.advanceTimersByTime(500)
    assertToBeCopied(element, {copied: false})
  })
})

function mountCopyCode(props) {
  return mount(
    <IntlProvider>
      <CopyCode {...props} />
    </IntlProvider>
    ).find(CopyCode)
}

function assertToBeCopied(element, {copied}) {
  expect(element.find(CopyText).state().copied).toBe(copied)
}