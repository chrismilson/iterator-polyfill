import '..'

function* n() {
  yield 1
  yield 2
  yield 3
}

describe('Iterator', () => {
  it('should be defined globally', () => {
    expect(Iterator).not.toBeUndefined()
  })

  describe.each<[string, Iterable<number | number[]>]>([
    ['Set', new Set([1])],
    ['Array', [1]],
    ['Map', new Map([[1, 1]])],
    [
      'Generator function',
      (function* () {
        yield 1
      })(),
    ],
  ])('builtin %s iterator', (name, instance) => {
    const iterator = instance[Symbol.iterator]()
    it('should extend the global Iterator', () => {
      expect(iterator.map).not.toBeUndefined()
      expect(iterator.filter).not.toBeUndefined()
      expect(iterator.reduce).not.toBeUndefined()

      expect(iterator).toBeInstanceOf(Iterator)
    })

    it('Should yield the first value', () => {
      const next = iterator.next()

      if (next.value instanceof Array) {
        expect(next).toMatchObject({ done: false, value: [1, 1] })
      } else {
        expect(next).toMatchObject({ done: false, value: 1 })
      }
    })
  })

  describe('new Iterator', () => {
    const iterator = new Iterator()

    it('Should not implement next', () => {
      expect(iterator.next).toThrow('Method not implemented.')
    })
  })

  describe('map', () => {})
  describe('filter', () => {})
  describe('take', () => {})
  describe('drop', () => {})
  describe('asIndexedPairs', () => {})
  describe('flatMap', () => {})
  describe('reduce', () => {})
  describe('toArray', () => {})
  describe('forEach', () => {})
  describe('some', () => {})
  describe('every', () => {})
  describe('find', () => {})
})
