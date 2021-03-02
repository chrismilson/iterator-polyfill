/**
 * Implements the newly proposed methods for the Iterator.
 */
export class IteratorPolyfill<T, TReturn = any, TNext = undefined> {
  *map<R>(
    this: Iterator<T, TReturn, TNext>,
    callbackfn: (value: T) => R
  ): Generator<R, TReturn, TNext> {
    const it = this
    // The type should be TNext, but the proposal says it should be initialised
    // to undefined.
    let lastValue: TNext = undefined!
    let next = it.next(lastValue)

    while (!next.done) {
      const { value } = next
      const mapped = callbackfn(value as T)
      lastValue = yield mapped
      next = it.next(lastValue)
    }

    return next.value
  }

  *filter(
    this: Iterator<T, TReturn, TNext>,
    predicate: (value: T) => boolean
  ): Generator<T, TReturn, TNext> {
    const it = this
    // see above
    let lastValue: TNext = undefined!
    let next = it.next(lastValue)

    while (!next.done) {
      const { value } = next
      const selected = predicate(value as T)
      if (selected) {
        lastValue = yield value as T
      }
      next = it.next(lastValue)
    }

    return next.value
  }

  *take(
    this: Iterator<T, TReturn, TNext>,
    limit: number
  ): Generator<T, undefined, TNext> {
    let remaining = isNaN(limit) ? 0 : Math.floor(limit)
    if (remaining < 0) {
      throw new RangeError()
    }

    const it = this
    // see above
    let lastValue: TNext = undefined!

    while (remaining > 0) {
      remaining -= 1
      const next = it.next(lastValue)

      if (next.done) {
        return
      }

      lastValue = yield next.value as T
    }
  }

  *drop(
    this: Iterator<T, TReturn, TNext>,
    limit: number
  ): Generator<T, TReturn, TNext> {
    let remaining = isNaN(limit) ? 0 : Math.floor(limit)
    if (remaining < 0) {
      throw new RangeError()
    }
    const it = this

    while (remaining > 0) {
      remaining -= 1
      const next = it.next()
      if (next.done) {
        return next.value
      }
    }

    // see above
    let lastValue: TNext = undefined!
    let next = it.next(lastValue)

    while (!next.done) {
      lastValue = yield next.value as T
      next = it.next(lastValue)
    }

    return next.value
  }

  *asIndexedPairs(
    this: Iterator<T, TReturn, TNext>
  ): Generator<[number, T], TReturn, TNext> {
    const it = this
    let index = 0
    // see above
    let lastValue: TNext = undefined!
    let next = it.next(lastValue)

    while (!next.done) {
      const { value } = next
      lastValue = yield [index++, value]
      next = it.next(lastValue)
    }

    return next.value
  }

  *flatMap<R>(
    this: Iterator<T, TReturn, TNext>,
    mapper: (value: T) => Iterable<R>
  ): Generator<R, TReturn, undefined> {
    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      yield* mapper(value)
      next = it.next()
    }

    return next.value
  }

  reduce(
    this: Iterator<T, TReturn, TNext>,
    reducer: (acc: any, value: T) => any,
    // May contain the initial value, we want to be able to check whether it was
    // passed or not. We can't do this just by checking for undefined, since
    // passing undefined explicitly is a valid initial value.
    ...args: [] | [any]
  ): any {
    const it = this
    let next = it.next()
    let accumulator: any

    if (args.length === 0) {
      if (next.done) {
        throw new TypeError()
      }
      accumulator = next.value
      next = it.next()
    } else {
      accumulator = args[0]
    }

    while (!next.done) {
      const { value } = next
      accumulator = reducer(accumulator, value)
      next = it.next()
    }

    return accumulator
  }

  toArray(this: Iterator<T, TReturn, TNext>): T[] {
    const result: T[] = []

    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      result.push(value)
      next = it.next()
    }

    return result
  }

  forEach(
    this: Iterator<T, TReturn, TNext>,
    callback: (value: T) => any
  ): void {
    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      callback(value)
      next = it.next()
    }
  }

  some(
    this: Iterator<T, TReturn, TNext>,
    predicate: (value: T) => boolean
  ): boolean {
    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      if (predicate(value)) {
        it.return && it.return()
        return true
      }
      next = it.next()
    }
    return false
  }

  every(
    this: Iterator<T, TReturn, TNext>,
    predicate: (value: T) => boolean
  ): boolean {
    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      if (!predicate(value)) {
        it.return && it.return()
        return false
      }
      next = it.next()
    }
    return true
  }

  find(
    this: Iterator<T, TReturn, TNext>,
    predicate: (value: T) => boolean
  ): T | undefined {
    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      if (predicate(value)) {
        it.return && it.return()
        return value
      }
    }
  }

  [Symbol.toStringTag] = 'Iterator'

  static from<T>(iterable: Iterable<T>): Iterator<T> {
    return iterable[Symbol.iterator]()
  }
}

export class AsyncIteratorPolyfill<T, TReturn, TNext> {
  async *map<R>(
    this: AsyncIterator<T, TReturn, TNext>,
    callback: (value: T) => Promise<R> | R
  ): AsyncGenerator<T, TReturn, TNext> {
    throw new Error('Method not implemented.')
  }
  filter(this: AsyncIterator<T, TReturn, TNext>, callback: any) {
    throw new Error('Method not implemented.')
  }
  take(
    this: AsyncIterator<T, TReturn, TNext>,
    limit: number
  ): AsyncIterator<T, TReturn, TNext> {
    throw new Error('Method not implemented.')
  }
  drop(
    this: AsyncIterator<T, TReturn, TNext>,
    limit: number
  ): AsyncIterator<T, TReturn, TNext> {
    throw new Error('Method not implemented.')
  }
  asIndexedPairs(
    this: AsyncIterator<T, TReturn, TNext>
  ): AsyncIterator<[number, T], TReturn, TNext> {
    throw new Error('Method not implemented.')
  }
  flatMap<R>(
    this: AsyncIterator<T, TReturn, TNext>,
    mapper: (value: T) => R | AsyncIterator<R, any, undefined>
  ): AsyncIterator<R, TReturn, TNext> {
    throw new Error('Method not implemented.')
  }
  reduce(
    this: AsyncIterator<T, TReturn, TNext>,
    reducer: any,
    initial_value?: any
  ) {
    throw new Error('Method not implemented.')
  }
  toArray(
    this: AsyncIterator<T, TReturn, TNext>,
    max_count?: number
  ): Promise<T[]> {
    throw new Error('Method not implemented.')
  }
  forEach(
    this: AsyncIterator<T, TReturn, TNext>,
    callback: (value: T) => any
  ): Promise<void> {
    throw new Error('Method not implemented.')
  }
  some(
    this: AsyncIterator<T, TReturn, TNext>,
    callback: (value: T) => Promise<boolean>
  ): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  every(
    this: AsyncIterator<T, TReturn, TNext>,
    callback: (value: T) => Promise<boolean>
  ): Promise<boolean> {
    throw new Error('Method not implemented.')
  }
  find(
    this: AsyncIterator<T, TReturn, TNext>,
    callback: (value: T) => Promise<boolean>
  ): Promise<T | undefined> {
    throw new Error('Method not implemented.')
  }
}
