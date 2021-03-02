import { IteratorPolyfill, AsyncIteratorPolyfill } from './polyfill'

// Here we merge the declarations of Iterator and AsyncIterator with their
// original TypeScript counterparts.

interface Iterator<T, TReturn = any, TNext = undefined> {
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
  take(limit: number): Iterator<T, TReturn, TNext>
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
  flatMap<R>(mapper: (value: T) => Iterable<R>): Iterator<R, TReturn, TNext>
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
  /** Find a specific value that returns `true` in {callback}, and return it. Returns `undefined` otherwise. */
  find(callback: (value: T) => boolean): T | undefined
}

type PromiseOrType<T> = Promise<T> | T

interface AsyncIterator<T, TReturn = any, TNext = undefined> {
  /** Map each value of iterator to another value via {callback}. */
  map<R>(
    callback: (value: T) => PromiseOrType<R>
  ): AsyncIterator<R, TReturn, TNext>
  /** Each value is given through {callback}, return `true` if value is needed into returned iterator. */
  filter<S extends T>(
    callback: (value: T) => value is S
  ): AsyncIterator<S, TReturn, TNext>
  filter(
    callback: (value: T) => PromiseOrType<boolean>
  ): AsyncIterator<T, TReturn, TNext>
  /** Create a new iterator that consume {limit} items, then stops. */
  take(limit: number): AsyncIterator<T, TReturn, TNext>
  /** Create a new iterator that skip {limit} items from source iterator, then yield all values. */
  drop(limit: number): AsyncIterator<T, TReturn, TNext>
  /** Get a pair [index, value] for each remaining value of iterable. */
  asIndexedPairs(): AsyncIterator<[number, T], TReturn, TNext>
  /** Like map, but you can return a new iterator that will be flattened. */
  flatMap<R>(
    mapper: (value: T) => AsyncIterator<R> | R
  ): AsyncIterator<R, TReturn, TNext>
  /** Accumulate each item inside **acc** for each value **value**. */
  reduce(reducer: (acc: T, value: T) => PromiseOrType<T>): T
  reduce(reducer: (acc: T, value: T) => PromiseOrType<T>, initial_value: T): T
  reduce<U>(
    reducer: (acc: U, value: T) => PromiseOrType<U>,
    initial_value: U
  ): Promise<U>
  /** Consume iterator and collapse values inside an array. */
  toArray(max_count?: number): Promise<T[]>
  /** Iterate over each value of iterator by calling **callback** for each value. */
  forEach(callback: (value: T) => PromiseOrType<any>): Promise<void>
  /** Return `true` if one value of iterator validate {callback}. */
  some(callback: (value: T) => PromiseOrType<boolean>): Promise<boolean>
  /** Return `true` if each value of iterator validate {callback}. */
  every(callback: (value: T) => PromiseOrType<boolean>): Promise<boolean>
  /** Find a specific value that returns `true` in {callback}, and return it. Returns `undefined` otherwise. */
  find(callback: (value: T) => PromiseOrType<boolean>): Promise<T | undefined>
}

// Now that Iterator and AsyncIterator are classes in the global namespace
// instead of just interfaces, we want to declare them as so.

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

declare global {
  namespace globalThis {
    var Iterator: IteratorConstructor

    var AsyncIterator: AsyncIteratorConstructor
  }
}

const initPolyfill = function () {
  const IteratorPolyfillPrototype = new IteratorPolyfill()
  const AsyncIteratorPolyfillPrototype = new AsyncIteratorPolyfill()

  // Add our polyfill to the prototype chain for the built in Iterator and
  // AsyncIterator.
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

  // @ts-ignore
  Iterator = IteratorPolyfillPrototype
  // @ts-ignore
  AsyncIterator = AsyncIteratorPolyfillPrototype
}
