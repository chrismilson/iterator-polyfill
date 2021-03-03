/*! ****************************************************************************

Here we merge the existing Iterator and AsyncIterator interfaces with our newly
proposed interfaces.

***************************************************************************** */

interface Iterator<T, TReturn, TNext> {
  /**
   * Map each value of iterator to another value via {callback}.
   */
  map<R>(callback: (value: T) => R): Iterator<R, TReturn, TNext>
  /**
   * Each value is given through {callback}, return `true` if value is needed
   * into returned iterator.
   */
  filter<S extends T>(
    callback: (value: T) => value is S
  ): Iterator<S, TReturn, TNext>
  filter(callback: (value: T) => boolean): Iterator<T, TReturn, TNext>
  /**
   * Create a new iterator that consume {limit} items, then stops.
   */
  take(limit: number): Iterator<T, undefined, TNext>
  /**
   * Create a new iterator that skip {limit} items from source iterator, then
   * yield all values.
   */
  drop(limit: number): Iterator<T, TReturn, TNext>
  /**
   * Get a pair [index, value] for each remaining value of iterable.
   */
  asIndexedPairs(): Iterator<[number, T], TReturn, TNext>
  /**
   * Like map, but you can return a new iterator that will be flattened.
   */
  flatMap<R>(mapper: (value: T) => Iterable<R>): Iterator<R, TReturn, undefined>
  /**
   * Accumulate each item inside **acc** for each value **value**.
   */
  reduce(reducer: (acc: T, value: T) => T): T
  reduce(reducer: (acc: T, value: T) => T, initial_value: T): T
  reduce<U>(reducer: (acc: U, value: T) => U, initial_value: U): U
  /**
   * Consume iterator and collapse values inside an array.
   */
  toArray(max_count?: number): T[]
  /**
   * Iterate over each value of iterator by calling **callback** for each value.
   */
  forEach(callback: (value: T) => any): void
  /**
   * Return `true` if one value of iterator validate {callback}.
   */
  some(callback: (value: T) => boolean): boolean
  /**
   * Return `true` if each value of iterator validate {callback}.
   */
  every(callback: (value: T) => boolean): boolean
  /**
   * Find a specific value that returns `true` in {callback}, and return it.
   * Returns `undefined` otherwise.
   */
  find(callback: (value: T) => boolean): T | undefined
}

interface AsyncIterator<T, TReturn, TNext> {
  /**
   * Map each value of iterator to another value via {callback}.
   */
  map<R>(
    callback: (value: T) => R | PromiseLike<R>
  ): AsyncIterator<R, TReturn, TNext>
  /**
   * Each value is given through {callback}, return `true` if value is needed
   * into returned iterator.
   */
  filter<S extends T>(
    callback: (value: T) => value is S
  ): AsyncIterator<S, TReturn, TNext>
  filter(
    callback: (value: T) => boolean | PromiseLike<boolean>
  ): AsyncIterator<T, TReturn, TNext>
  /**
   * Create a new iterator that consume {limit} items, then stops.
   */
  take(limit: number): AsyncIterator<T, undefined, TNext>
  /**
   * Create a new iterator that skip {limit} items from source iterator, then
   * yield all values.
   */
  drop(limit: number): AsyncIterator<T, TReturn, TNext>
  /**
   * Get a pair [index, value] for each remaining value of iterable.
   */
  asIndexedPairs(): AsyncIterator<[number, T], TReturn, TNext>
  /**
   * Like map, but you can return a new iterator that will be flattened.
   */
  flatMap<R>(
    mapper: (value: T) => AsyncIterable<R> | PromiseLike<AsyncIterable<R>>
  ): AsyncIterator<R, TReturn, undefined>
  /**
   * Accumulate each item inside **acc** for each value **value**.
   */
  reduce(reducer: (acc: T, value: T) => T | PromiseLike<T>): Promise<T>
  reduce(
    reducer: (acc: T, value: T) => T | PromiseLike<T>,
    initial_value: T
  ): Promise<T>
  reduce<U>(
    reducer: (acc: U, value: T) => U | PromiseLike<U>,
    initial_value: U
  ): Promise<U>
  /**
   * Consume iterator and collapse values inside an array.
   */
  toArray(max_count?: number): Promise<T[]>
  /**
   * Iterate over each value of iterator by calling **callback** for each
   * value.
   */
  forEach(callback: (value: T) => any): Promise<void>
  /**
   * Return `true` if one value of iterator validate {callback}.
   */
  some(callback: (value: T) => boolean | PromiseLike<boolean>): Promise<boolean>
  /**
   * Return `true` if each value of iterator validate {callback}.
   */
  every(
    callback: (value: T) => boolean | PromiseLike<boolean>
  ): Promise<boolean>
  /** Find a specific value that returns `true` in {callback}, and return it.
   * Returns `undefined` otherwise. */
  find(
    callback: (value: T) => boolean | PromiseLike<boolean>
  ): Promise<T | undefined>
}

/*! ****************************************************************************

Since Iterator and AsyncIterator are attached to the global object in the
proposal, we need to declare them as so.

***************************************************************************** */

interface IteratorConstructor {
  new (): Iterator<any>
  new <T>(): Iterator<T>
  new <T, TReturn, TNext>(): Iterator<T, TReturn, TNext>
  from<T>(iterable: Iterable<T>): Iterator<T>

  readonly prototype: Iterator<any>
}

interface AsyncIteratorConstructor {
  new (): AsyncIterator<any>
  new <T>(): AsyncIterator<T>
  new <T, TReturn, TNext>(): AsyncIterator<T, TReturn, TNext>
  from<T>(iterable: AsyncIterable<T>): AsyncIterator<T>

  readonly prototype: AsyncIterator<any>
}

declare var Iterator: IteratorConstructor
declare var AsyncIterator: AsyncIteratorConstructor

/*! ****************************************************************************

Here we implement the new methods from the proposal. We will use instances of
these classes to augment the existing Iterator prototype under the hood.

***************************************************************************** */

/**
 * Implements the class methods of the newly proposed Iterator.
 */
class IteratorPolyfill<T, TReturn = any, TNext = undefined>
  implements Iterator<T, TReturn, TNext> {
  next(...args: [] | [TNext]): IteratorResult<T, TReturn> {
    throw new Error('Method not implemented.')
  }
  return?(value?: TReturn): IteratorResult<T, TReturn>
  throw?(e?: any): IteratorResult<T, TReturn>

  static from<T>(iterable: Iterable<T>): Iterator<T> {
    return iterable[Symbol.iterator]()
  }

  *map<R>(callbackfn: (value: T) => R): Generator<R, TReturn, TNext> {
    const it = this
    // The type should be TNext, but the proposal says it should be initialised
    // to undefined.
    let lastValue: TNext = undefined!
    let next = it.next(lastValue)

    while (!next.done) {
      const { value } = next
      const mapped = callbackfn(value)
      lastValue = yield mapped
      next = it.next(lastValue)
    }

    return next.value
  }

  *filter(predicate: (value: T) => boolean): Generator<T, TReturn, TNext> {
    const it = this
    // see above
    let lastValue: TNext = undefined!
    let next = it.next(lastValue)

    while (!next.done) {
      const { value } = next
      const selected = predicate(value)
      if (selected) {
        lastValue = yield value
      }
      next = it.next(lastValue)
    }

    return next.value
  }

  *take(limit: number): Generator<T, undefined, TNext> {
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

      lastValue = yield next.value
    }
    it.return && it.return()
  }

  *drop(limit: number): Generator<T, TReturn, TNext> {
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
      lastValue = yield next.value
      next = it.next(lastValue)
    }

    return next.value
  }

  *asIndexedPairs(): Generator<[number, T], TReturn, TNext> {
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

  toArray(): T[] {
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

  forEach(callback: (value: T) => any): void {
    const it = this
    let next = it.next()

    while (!next.done) {
      const { value } = next
      callback(value)
      next = it.next()
    }
  }

  some(predicate: (value: T) => boolean): boolean {
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

  every(predicate: (value: T) => boolean): boolean {
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

  find(predicate: (value: T) => boolean): T | undefined {
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

  from<T>(iterable: Iterable<T>): Iterator<T> {
    return iterable[Symbol.iterator]()
  }
}

class AsyncIteratorPolyfill<T, TReturn, TNext>
  implements AsyncIterator<T, TReturn, TNext> {
  next(...args: [] | [TNext]): Promise<IteratorResult<T, TReturn>> {
    throw new Error('Method not implemented.')
  }
  return?(
    value?: TReturn | PromiseLike<TReturn>
  ): Promise<IteratorResult<T, TReturn>>
  throw?(e?: any): Promise<IteratorResult<T, TReturn>>\

  static from<T>(asyncIterable: AsyncIterable<T>): AsyncIterator<T> {
    return asyncIterable[Symbol.asyncIterator]()
  }

  async *map<R>(
    callback: (value: T) => R | PromiseLike<R>
  ): AsyncGenerator<R, TReturn, TNext> {
    const it = this
    // see above
    let lastValue: TNext = undefined!
    let next = await it.next(lastValue)

    while (!next.done) {
      const { value } = next
      const mapped = await callback(value)
      lastValue = yield mapped
      next = await it.next(lastValue)
    }

    return next.value
  }

  async *filter(
    predicate: (value: T) => boolean | PromiseLike<boolean>
  ): AsyncGenerator<T, TReturn, TNext> {
    const it = this
    // see above
    let lastValue: TNext = undefined!
    let next = await it.next(lastValue)

    while (!next.done) {
      const { value } = next
      if (await predicate(value)) {
        lastValue = yield value
      }
      next = await it.next(lastValue)
    }

    return next.value
  }

  async *take(limit: number): AsyncGenerator<T, undefined, TNext> {
    let remaining = isNaN(limit) ? 0 : Math.floor(limit)
    if (remaining < 0) {
      throw new RangeError()
    }

    const it = this
    // see above
    let lastValue: TNext = undefined!

    while (remaining > 0) {
      remaining -= 1
      const next = await it.next(lastValue)

      if (next.done) {
        return
      }

      lastValue = yield next.value
    }
    it.return && (await it.return())
  }

  async *drop(limit: number): AsyncGenerator<T, TReturn, TNext> {
    let remaining = isNaN(limit) ? 0 : Math.floor(limit)
    if (remaining < 0) {
      throw new RangeError()
    }
    const it = this

    while (remaining > 0) {
      remaining -= 1
      const next = await it.next()
      if (next.done) {
        return next.value
      }
    }

    // see above
    let lastValue: TNext = undefined!
    let next = await it.next(lastValue)

    while (!next.done) {
      lastValue = yield next.value
      next = await it.next(lastValue)
    }

    return next.value
  }

  async *asIndexedPairs(): AsyncGenerator<[number, T], TReturn, TNext> {
    const it = this
    let index = 0
    // see above
    let lastValue: TNext = undefined!
    let next = await it.next(lastValue)

    while (!next.done) {
      const { value } = next
      lastValue = yield [index++, value]
      next = await it.next(lastValue)
    }

    return next.value
  }

  async *flatMap<R>(
    mapper: (value: T) => AsyncIterable<R> | PromiseLike<AsyncIterable<R>>
  ): AsyncGenerator<R, TReturn, undefined> {
    const it = this
    let next = await it.next()

    while (!next.done) {
      const { value } = next
      yield* await mapper(value)
      next = await it.next()
    }

    return next.value
  }

  async reduce(
    reducer: (acc: any, value: T) => any | PromiseLike<any>,
    ...args: [] | [any]
  ): Promise<any> {
    const it = this
    let next = await it.next()
    let accumulator: any

    if (args.length === 0) {
      if (next.done) {
        throw new TypeError()
      }
      accumulator = next.value
      next = await it.next()
    } else {
      accumulator = args[0]
    }

    while (!next.done) {
      const { value } = next
      accumulator = await reducer(accumulator, value)
      next = await it.next()
    }

    return accumulator
  }

  async toArray(): Promise<T[]> {
    const result: T[] = []

    const it = this
    let next = await it.next()

    while (!next.done) {
      const { value } = next
      result.push(value)
      next = await it.next()
    }

    return result
  }

  async forEach(callback: (value: T) => any): Promise<void> {
    const it = this
    let next = await it.next()

    while (!next.done) {
      const { value } = next
      await callback(value)
      next = await it.next()
    }
  }

  async some(
    predicate: (value: T) => boolean | PromiseLike<boolean>
  ): Promise<boolean> {
    const it = this
    let next = await it.next()

    while (!next.done) {
      const { value } = next
      if (await predicate(value)) {
        it.return && it.return()
        return true
      }
      next = await it.next()
    }
    return false
  }

  async every(
    predicate: (value: T) => boolean | PromiseLike<boolean>
  ): Promise<boolean> {
    const it = this
    let next = await it.next()

    while (!next.done) {
      const { value } = next
      if (!(await predicate(value))) {
        it.return && it.return()
        return false
      }
      next = await it.next()
    }
    return true
  }

  async find(
    predicate: (value: T) => boolean | PromiseLike<boolean>
  ): Promise<T | undefined> {
    const it = this
    let next = await it.next()

    while (!next.done) {
      const { value } = next
      if (await predicate(value)) {
        it.return && it.return()
        return value
      }
      next = await it.next()
    }
  }
}

/*! ****************************************************************************

Here we initialise the polyfill.

***************************************************************************** */

const initPolyfill = function () {
  // There are two parts to initialising the polyfill:

  // First we add our polyfill to the prototype chain for the inbuild iterator
  // prototype.

  const IteratorPolyfillPrototype = new IteratorPolyfill()
  const AsyncIteratorPolyfillPrototype = new AsyncIteratorPolyfill()

  // Add our polyfill to the prototype chain for the built in Iterator and
  // AsyncIterator.

  // We get the original prototype for Iterator from the Array iterator, but we
  // could do this from any builtin that implements Iterator.
  const ArrayIteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]())
  const OriginalIteratorPrototype = Object.getPrototypeOf(
    ArrayIteratorPrototype
  )
  Object.setPrototypeOf(OriginalIteratorPrototype, IteratorPolyfillPrototype)

  const AsyncGeneratorPrototype = Object.getPrototypeOf(
    (async function* () {})()[Symbol.asyncIterator]()
  )
  const BaseAsyncGeneratorPrototype = Object.getPrototypeOf(
    AsyncGeneratorPrototype
  )
  const OriginalAsyncIteratorPrototype = Object.getPrototypeOf(
    BaseAsyncGeneratorPrototype
  )

  Object.setPrototypeOf(
    OriginalAsyncIteratorPrototype,
    AsyncIteratorPolyfillPrototype
  )

  globalThis.Iterator = IteratorPolyfill
  globalThis.AsyncIterator = AsyncIteratorPolyfill
}
initPolyfill()
