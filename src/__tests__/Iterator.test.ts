import '..'

function* naturals() {
  let i = 1
  while (true) yield i++
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

    it('should yield the first value', () => {
      const next = iterator.next()

      if (next.value instanceof Array) {
        expect(next).toMatchObject({ done: false, value: [1, 1] })
      } else {
        expect(next).toMatchObject({ done: false, value: 1 })
      }
    })
  })

  describe('map', () => {
    const values = [1, 2, 3, 4, 5]

    it('should apply the map to each value in the iterator', () => {
      const iterator = Iterator.from(values)
      const mapper: (v: number) => number = (v) => v * 2

      expect(iterator.map(mapper).toArray()).toMatchObject(values.map(mapper))
    })

    it('should apply the map to each value only once', () => {
      const iterator = Iterator.from(values)
      const mapper = (v: number): number => v * 2
      let count = 0
      const mapAndCount = (v: number): number => {
        count += 1
        return mapper(v)
      }

      expect(iterator.map(mapAndCount).toArray()).toMatchObject(
        values.map(mapper)
      )
      expect(count).toBe(values.length)
    })
  })

  describe('filter', () => {
    const values = 'happy'

    it('should not yield values that do not match the predicate', () => {
      const iterator = Iterator.from(values)

      expect(iterator.filter(() => false).toArray().length).toBe(0)
    })

    it('should yield values that match the predicate', () => {
      const iterator = Iterator.from(values)

      expect(
        iterator
          .filter(() => true)
          .toArray()
          .join('')
      ).toBe(values)
    })
  })

  describe('take', () => {
    it('should return an iterator with the correct number of values', () => {
      const target = 5
      const iterator = Iterator.from(naturals())

      expect(iterator.take(target).toArray()).toMatchObject([1, 2, 3, 4, 5])
    })

    it('should throw a range error if passed a negative number', () => {
      expect(() => naturals().take(-10.5).next()).toThrow(RangeError)
    })
  })

  describe('drop', () => {
    it('should return an iterator with the first few values removed', () => {
      const iterator = naturals().drop(5)

      expect(iterator.next()).toMatchObject({ value: 6 })
    })

    it('should throw a range error if passed a negative number', () => {
      expect(() => naturals().drop(-10.5).next()).toThrow(RangeError)
    })
  })

  describe('asIndexedPairs', () => {
    it('should iterate indexed pairs of the iterator', () => {
      const values = 'Hello'
      const iterator = Iterator.from(values).asIndexedPairs()

      expect(iterator.next().value).toMatchObject([0, 'H'])
      expect(iterator.next().value).toMatchObject([1, 'e'])
      expect(iterator.next().value).toMatchObject([2, 'l'])
      expect(iterator.next().value).toMatchObject([3, 'l'])
      expect(iterator.next().value).toMatchObject([4, 'o'])
      expect(iterator.next()).toMatchObject({ done: true })
    })
  })

  describe('flatMap', () => {
    it('should iterate the mapped iterables as a single iterator', () => {
      const values = [
        [1, 2, 3],
        [4, 5, 6],
        [7, 8, 9],
      ]
      const toFlatten = Iterator.from(values)

      expect(toFlatten.flatMap((v) => v).toArray()).toMatchObject(values.flat())
    })
  })

  describe('reduce', () => {
    it('should use the first value from the iterator as the initial value if it\
 was not passed', () => {
      const first = {}
      const iterator = Iterator.from([first])

      expect(iterator.reduce((acc) => acc)).toBe(first)
    })

    it('should use the passed initial value EVEN if it is undefined', () => {
      const first = {}
      const initial = undefined
      const iterator = Iterator.from([first])

      expect(iterator.reduce((acc) => acc, initial)).toBe(initial)
    })

    it('should throw a TypeError if called on an empty iterator with no initial value', () => {
      const iterator = Iterator.from([])

      expect(() => iterator.reduce((acc) => acc)).toThrow(TypeError)
    })

    it('should reduce an iterator correctly', () => {
      // Will calculate the sum of the iterator
      const reducer = (acc: number, val: number) => acc + val
      // The sum of this iterator should be 15
      const iterator = Iterator.from([1, 2, 3, 4, 5])

      expect(iterator.reduce(reducer)).toBe(15)
    })
  })

  describe('toArray', () => {
    it('should produce an array with the same values as would be iterated', () => {
      const values = [1, 'hello', NaN, {}, {}, {}]
      const iterator = Iterator.from(values)

      expect(iterator.toArray()).toMatchObject(values)
    })
  })

  describe('forEach', () => {
    it('should fire the callback on the iterator elements in order', () => {
      const values = [1, 2, 3, 4, 5]
      let i = 0

      const callback = (value: number) => {
        expect(value).toBe(values[i++])
      }

      Iterator.from(values).forEach(callback)
    })
  })

  describe('some', () => {
    it('should return true if any of the members is truthy', () => {
      const iterator = Iterator.from([0, 1, 0])

      // In terms of types, number is not assignable to boolean, but we want to
      // check that it handles truthy and falsy values correctly.
      // @ts-expect-error
      expect(iterator.some((v) => v)).toBe(true)
    })

    it('should return false if all of the members are falsy', () => {
      const iterator = Iterator.from([0, 0, 0])

      // see above
      // @ts-expect-error
      expect(iterator.some((v) => v)).toBe(false)
    })

    it('should return false on an empty iterator', () => {
      const iterator = Iterator.from([])

      expect(iterator.some(() => true)).toBe(false)
    })
  })

  describe('every', () => {
    it('should return false if any of the members is falsy', () => {
      const iterator = Iterator.from([1, 0, 1])

      // see above
      // @ts-expect-error
      expect(iterator.every((v) => v)).toBe(false)
    })

    it('should return true if all of the members are truthy', () => {
      const iterator = Iterator.from([1, 1, 1])

      // see above
      // @ts-expect-error
      expect(iterator.every((v) => v)).toBe(true)
    })

    it('should return true on an empty iterator', () => {
      const iterator = Iterator.from([])

      expect(iterator.every(() => false)).toBe(true)
    })
  })

  describe('find', () => {
    it('should return the first element satisfying the predicate', () => {
      const iterator = Iterator.from([1, 2, 3, 4, 5])

      expect(iterator.find((v) => v > 3)).toBe(4)
    })

    it('should return undefined if the perdicate is false on all values', () => {
      const iterator = Iterator.from([1, 2, 3, 4, 5])

      expect(iterator.find((v) => v > 5)).toBeUndefined()
    })
  })

  describe('static from method', () => {
    it('should be defined', () => {
      expect(Iterator.from).not.toBeUndefined()
    })

    it('should return an iterator when passed an iterable', () => {
      const iterable = [1, 2, 3]

      expect(Iterator.from(iterable)).toBeInstanceOf(Iterator)
    })

    it('should throw a TypeError if passed a non-iterable object', () => {
      const nonIterable = 100

      // @ts-expect-error Iterator.from expects an iterable.
      expect(() => Iterator.from(nonIterable)).toThrow(TypeError)
    })
  })
})
