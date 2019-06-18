/*
 * Copyright © 2019-present Mia s.r.l.
 * All rights reserved
 */
import MultipartFormData from "../../src/lib/multipart-form-data";

describe('MultipartFormData', () => {
  const now = Date.now()
  const dateNow = Date.now
  
  beforeAll(() => { Date.now = jest.fn(() => now )} )

  beforeEach(() => Date.now.mockClear())

  afterAll(() => { Date.now = dateNow })

  it('should append new pieces', () => {
    const form = new MultipartFormData()

    form.append('part1', 'some_text')
    expect(Object.keys(form.parts).length).toEqual(1)
    expect(form.parts.part1).not.toBe(undefined)
    expect(form.parts.part1).toEqual('some_text')

    form.append('part2', 'another_text')
    expect(Object.keys(form.parts).length).toEqual(2)
    expect(form.parts.part2).not.toBe(undefined)
    expect(form.parts.part2).toEqual('another_text')
  })

  it('should generate proper body', () => {
    const form = new MultipartFormData()
    const part1 = {data: '234', filename: 'cat.jpeg', contentType: 'binary'}
    const part2 = {data: '{"some":"body"}', filename: 'mouse.jpeg', contentType: 'application/json'}
    form.append('part1', part1)
    form.append('part2', part2)

    const out = form.generate()
    expect(Date.now).toHaveBeenCalled()
    expect(out.headers['Content-Type']).toEqual(`multipart/form-data; boundary=${now}`)

    const bodyParts = out.body.split('\r\n')
    expect(bodyParts.length).toEqual(12)
    expect(bodyParts[0]).toEqual(`--${now}`)
    expect(bodyParts[1]).toEqual(`Content-Disposition: form-data; name="part1"; filename="cat.jpeg"`)
    expect(bodyParts[2]).toEqual('Content-Type: binary')
    expect(bodyParts[3]).toEqual('')
    expect(bodyParts[4]).toEqual(`${part1.data}`)
    expect(bodyParts[5]).toEqual(`--${now}`)
    expect(bodyParts[6]).toEqual(`Content-Disposition: form-data; name="part2"; filename="mouse.jpeg"`)
    expect(bodyParts[7]).toEqual('Content-Type: application/json')
    expect(bodyParts[8]).toEqual('')
    expect(bodyParts[9]).toEqual(`${part2.data}`)
    expect(bodyParts[10]).toEqual(`--${now}--`)
    expect(bodyParts[11]).toEqual('')
  })
})
