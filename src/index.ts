'use strict';

type PromiseOrType<T> = Promise<T> | T;

/*
 * Type definitions for extending Window interface
 */

interface IteratorPrototype<T, TReturn = any, TNext = undefined> {
  protoype: Iterator<T, TReturn, TNext>;
}

interface AsyncIteratorPrototype<T, TReturn = any, TNext = undefined> {
  protoype: AsyncIterator<T, TReturn, TNext>;
}

interface Window {
  Iterator: IteratorPrototype<any>;
  AsyncIterator: AsyncIteratorPrototype<any>;
}

declare const Iterator: IteratorPrototype<any>;
declare const AsyncIterator: IteratorPrototype<any>;

/*
 * Type definitions for extending Iterator & AsyncIterator interfaces
 */

interface Iterator<T, TReturn = any, TNext = undefined> {
  /** Map each value of iterator to another value via {callback}. */
  map<R>(callback: (value: T) => R) : Iterator<R, TReturn, TNext>;
  /** Each value is given through {callback}, return `true` if value is needed into returned iterator. */
  filter(callback: (value: T) => boolean) : Iterator<T, TReturn, TNext>;
  /** Create a new iterator that consume {limit} items, then stops. */
  take(limit: number) : Iterator<T, TReturn, TNext>;
  /** Create a new iterator that skip {limit} items from source iterator, then yield all values. */
  drop(limit: number) : Iterator<T, TReturn, TNext>;
  /** Get a pair [index, value] for each remaining value of iterable. */
  asIndexedPairs() : Iterator<[number, T], TReturn, TNext>;
  /** Like map, but you can return a new iterator that will be flattened. */
  flatMap<R>(mapper: (value: T) => Iterator<R> | R) : Iterator<R, TReturn, TNext>;
  /** Accumulate each item inside **acc** for each value **value**. */
  reduce<V = T>(reducer: (acc: V, value: T) => V, initial_value?: V) : V;
  /** Consume iterator and collapse values inside an array. */
  toArray(max_count?: number) : T[];
  /** Iterate over each value of iterator by calling **callback** for each value. */
  forEach(callback: (value: T) => any) : void;
  /** Return `true` if one value of iterator validate {callback}. */
  some(callback: (value: T) => boolean) : boolean;
  /** Return `true` if each value of iterator validate {callback}. */
  every(callback: (value: T) => boolean) : boolean;
  /** Find a specific value that returns `true` in {callback}, and return it. Returns `undefined` otherwise. */
  find(callback: (value: T) => boolean) : T | undefined;
}

interface AsyncIterator<T, TReturn = any, TNext = undefined> {
  /** Map each value of iterator to another value via {callback}. */
  map<R>(callback: (value: T) => PromiseOrType<R>) : AsyncIterator<R, TReturn, TNext>;
  /** Each value is given through {callback}, return `true` if value is needed into returned iterator. */
  filter(callback: (value: T) => PromiseOrType<boolean>) : AsyncIterator<T, TReturn, TNext>;
  /** Create a new iterator that consume {limit} items, then stops. */
  take(limit: number) : AsyncIterator<T, TReturn, TNext>;
  /** Create a new iterator that skip {limit} items from source iterator, then yield all values. */
  drop(limit: number) : AsyncIterator<T, TReturn, TNext>;
  /** Get a pair [index, value] for each remaining value of iterable. */
  asIndexedPairs() : AsyncIterator<[number, T], TReturn, TNext>;
  /** Like map, but you can return a new iterator that will be flattened. */
  flatMap<R>(mapper: (value: T) => AsyncIterator<R> | R) : AsyncIterator<R, TReturn, TNext>;
  /** Accumulate each item inside **acc** for each value **value**. */
  reduce<V = T>(reducer: (acc: V, value: T) => PromiseOrType<V>, initial_value?: V) : Promise<V>;
  /** Consume iterator and collapse values inside an array. */
  toArray(max_count?: number) : Promise<T[]>;
  /** Iterate over each value of iterator by calling **callback** for each value. */
  forEach(callback: (value: T) => PromiseOrType<any>) : Promise<void>;
  /** Return `true` if one value of iterator validate {callback}. */
  some(callback: (value: T) => PromiseOrType<boolean>) : Promise<boolean>;
  /** Return `true` if each value of iterator validate {callback}. */
  every(callback: (value: T) => PromiseOrType<boolean>) : Promise<boolean>;
  /** Find a specific value that returns `true` in {callback}, and return it. Returns `undefined` otherwise. */
  find(callback: (value: T) => PromiseOrType<boolean>) : Promise<T | undefined>;
}


/**
 * Polyfill
 * 
 * For both {Iterator.prototype} and {AsyncIterator.prototype}, 
 * polyfill is placed inside the prototype of original Iterator/AsyncIterator objects.
 * 
 * If methods like .take/.map/etc are implemented by engines, it won't mask them.
 */

(function () {
  function getGlobal() {
    if (typeof window !== 'undefined') {
      return window;
    }
    // @ts-ignore
    if (typeof global !== 'undefined') {
      // @ts-ignore
      return global;
    }
    return new Function('return this')();
  }

  const _globalThis = typeof globalThis === 'undefined' ? getGlobal() : globalThis;

  // polyfill already applied / proposal implemented
  if ('Iterator' in _globalThis && 'AsyncIterator' in _globalThis) {
    return;
  }

  // Polyfill for Iterator
  const IteratorPrototype = {};

  const ArrayIteratorPrototype = Object.getPrototypeOf([][Symbol.iterator]());
  const OriginalIteratorPrototype = Object.getPrototypeOf(ArrayIteratorPrototype);

  Object.setPrototypeOf(OriginalIteratorPrototype, IteratorPrototype);

  Object.defineProperties(IteratorPrototype, {
    [Symbol.iterator]: {
      value() {
        return this;
      }
    },
    map: {
      *value<T, R>(callback: (value: T) => R) {
        const it = this;
        let value = it.next();

        while (!value.done) {
          const real_value = callback(value.value);
          const next_value = yield real_value;
          value = it.next(next_value);
        }

        return value.value;
      },
    },
    filter: {
      *value<T>(callback: (value: T) => boolean) {
        const it = this;
        let value = it.next();
        let next_value;

        while (!value.done) {
          const real_value = value.value;
          if (callback(real_value)) {
            next_value = yield real_value;
            value = it.next(next_value);
          }
          else {
            value = it.next(next_value);
          }
        }

        return value.value;
      },
    },
    find: {
      value<T>(callback: (value: boolean) => T) {
        const it = this;
        let value = it.next();

        while (!value.done) {
          const real_value = value.value;

          if (callback(real_value))
            return real_value;

          value = it.next();
        }
      }
    },
    every: {
      value<T>(callback: (value: T) => boolean) {
        const it = this;
        let value = it.next();

        while (!value.done) {
          const real_value = value.value;

          if (!callback(real_value))
            return false;

          value = it.next();
        }
    
        return true;
      }
    },
    some: {
      value<T>(callback: (value: T) => boolean) {
        const it = this;
        let value = it.next();

        while (!value.done) {
          const real_value = value.value;

          if (callback(real_value))
            return true;

          value = it.next();
        }
    
        return false;
      }
    },
    toArray: {
      value(max_count = Infinity) {
        const values = [];

        const it = this;
        let value = it.next();

        while (!value.done) {
          const real_value = value.value;

          if (max_count <= 0)
            return values;

          values.push(real_value);

          if (max_count !== Infinity)
            max_count--;

          value = it.next();
        }

        return values;
      }
    },
    take: {
      *value(limit: number) {
        limit = Number(limit);
        if (limit < 0)
          throw new RangeError('Invalid limit.');

        const it = this;
        let value = it.next();
        let remaining = limit;
        let next_value;

        while (!value.done) {
          const real_value = value.value;

          if (remaining <= 0)
            return;

          next_value = yield real_value;
          value = it.next(next_value);
          remaining--;
        }

        return value.value;
      },
    },
    drop: {
      *value(limit: number) {
        limit = Number(limit);
        if (limit < 0)
          throw new RangeError('Invalid limit.');
          
        const it = this;
        let value = it.next();
        let remaining = limit;
        let next_value;

        while (!value.done) {
          const real_value = value.value;

          if (remaining > 0) {
            value = it.next(next_value);
            remaining--;
            continue;
          }

          next_value = yield real_value;
          value = it.next(next_value);
        }

        return value.value;
      },
    },
    asIndexedPairs: {
      *value() {
        const it = this;
        let value = it.next();
        let index = 0;

        while (!value.done) {
          const real_value = value.value;
          const next_value = yield [index, real_value];;
          value = it.next(next_value);
          index++;
        }

        return value.value;
      }
    },
    flatMap: {
      *value<T, R>(mapper: (value: T) => IterableIterator<R> | R) {
        if (typeof mapper !== 'function') {
          throw new TypeError('Mapper must be a function.');
        }

        const it = this;
        let value = it.next();
        let next_value;

        while (!value.done) {
          const real_value = value.value;
          const mapped = mapper(real_value);

          if (Symbol.iterator in mapped) {
            // @ts-ignore
            next_value = yield* mapped[Symbol.iterator]();
          } 
          else {
            next_value = yield mapped;
          }

          value = it.next(next_value);
        }

        return value.value;
      },
    },
    reduce: {
      value<T, V>(reducer: (acc: V, value: T) => V, initial_value?: V) {
        let acc = initial_value;

        const it = this;
        if (acc === undefined) {
          acc = it.next().value;
        }

        let value = it.next();
        while (!value.done) {
          const real_value = value.value;

          acc = reducer(acc!, real_value);

          value = it.next();
        }

        return acc;
      }
    },
    forEach: {
      value<T>(callback: (value: T) => any) {
        const it = this;
        let value = it.next();

        while (!value.done) {
          const real_value = value.value;

          callback(real_value);

          value = it.next();
        }
      }
    },
    [Symbol.toStringTag]: {
      value: 'IteratorPrototype'
    },
  });

  /// Polyfill for AsyncIterator
  const AsyncIteratorPrototype = {};

  const AsyncGeneratorPrototype = Object.getPrototypeOf((async function* () {})()[Symbol.asyncIterator]());
  const BaseAsyncGeneratorPrototype = Object.getPrototypeOf(AsyncGeneratorPrototype);
  const OriginalAsyncIteratorPrototype = Object.getPrototypeOf(BaseAsyncGeneratorPrototype);

  Object.setPrototypeOf(OriginalAsyncIteratorPrototype, AsyncIteratorPrototype);

  Object.defineProperties(AsyncIteratorPrototype, {
    [Symbol.asyncIterator]: {
      value() {
        return this;
      }
    },
    map: {
      async *value<T, R>(callback: (value: T) => PromiseOrType<R>) {
        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = await callback(value.value);
          const next_value = yield real_value;
          value = await it.next(next_value);
        }

        return value.value;
      },
    },
    filter: {
      async *value<T>(callback: (value: T) => PromiseOrType<boolean>) {
        const it = this;
        let value = await it.next();
        let next_value;

        while (!value.done) {
          const real_value = value.value;

          if (await callback(real_value)) {
            next_value = yield real_value;
          }

          value = await it.next(next_value);
        }

        return value.value;
      },
    },
    find: {
      async value<T>(callback: (value: T) => PromiseOrType<boolean>) {
        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = value.value;

          if (await callback(real_value))
            return real_value;

          value = await it.next();
        }
      }
    },
    every: {
      async value<T>(callback: (value: T) => PromiseOrType<boolean>) {
        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = value.value;

          if (!(await callback(real_value)))
            return false;

          value = await it.next();
        }
    
        return true;
      }
    },
    some: {
      async value<T>(callback: (value: T) => PromiseOrType<boolean>) {
        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = value.value;

          if (await callback(real_value))
            return true;

          value = await it.next();
        }
    
        return false;
      }
    },
    toArray: {
      async value(max_count = Infinity) {
        const values = [];

        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = value.value;

          if (max_count <= 0)
            return values;

          values.push(real_value);

          if (max_count !== Infinity)
            max_count--;

          value = await it.next();
        }

        return values;
      }
    },
    take: {
      async *value(limit: number) {
        limit = Number(limit);
        if (limit < 0)
          throw new RangeError('Invalid limit.');

        const it = this;
        let value = await it.next();
        let next_value;
        let remaining = limit;

        while (!value.done) {
          if (remaining <= 0)
            return;

          const real_value = value.value;

          next_value = yield real_value;
          value = await it.next(next_value);
          remaining--;
        }

        return value.value;
      },
    },
    drop: {
      async *value(limit: number) {
        limit = Number(limit);
        if (limit < 0)
          throw new RangeError('Invalid limit.');

        const it = this;
        let value = await it.next();
        let next_value;
        let remaining = limit;

        while (!value.done) {
          if (remaining > 0) {
            remaining--;
            value = await it.next(next_value);
            continue;
          }

          const real_value = value.value;

          next_value = yield real_value;
          value = await it.next(next_value);
          remaining--;
        }

        return value.value;
      },
    },
    asIndexedPairs: {
      async *value() {
        let index = 0;

        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = value.value;
          const next_value = yield [index, real_value];
          index++
          value = await it.next(next_value);
        }

        return value.value;
      }
    },
    flatMap: {
      async *value<T, R>(mapper: (value: T) => AsyncIterator<R> | R) {
        if (typeof mapper !== 'function') {
          throw new TypeError('Mapper must be a function.');
        }

        const it = this;
        let value = await it.next();
        let next_value;

        while (!value.done) {
          const real_value = value.value;
          const mapped = mapper(real_value);

          if (Symbol.asyncIterator in mapped) {
            // @ts-ignore
            yield* mapped[Symbol.asyncIterator]();
          } 
          else if (Symbol.iterator in mapped) {
            // @ts-ignore
            yield* mapped[Symbol.iterator]();
          }
          else {
            yield mapped;
          }

          value = await it.next(next_value);
        }

        return value.value;
      },
    },
    reduce: {
      async value<T, V>(reducer: (acc: V, value: T) => PromiseOrType<V>, initial_value?: V) {
        let acc = initial_value;

        const it = this;
        if (acc === undefined) {
          acc = (await it.next()).value;
        }

        for await (const value of it) {
          acc = await reducer(acc!, value);
        }

        return acc;
      }
    },
    forEach: {
      async value<T>(callback: (value: T) => PromiseOrType<any>) {
        const it = this;
        let value = await it.next();

        while (!value.done) {
          const real_value = value.value;

          await callback(real_value);

          value = await it.next();
        }
      }
    },
    [Symbol.toStringTag]: {
      value: 'AsyncIteratorPrototype'
    },
  });

  if (!('Iterator' in _globalThis)) {
    const Iterator = function Iterator() {};

    Iterator.prototype = IteratorPrototype;

    // @ts-ignore
    (_globalThis as Window).Iterator = Iterator;
  }
  if (!('AsyncIterator' in _globalThis)) {
    const AsyncIterator = function AsyncIterator() {};

    AsyncIterator.prototype = AsyncIteratorPrototype;

    // @ts-ignore
    (_globalThis as Window).AsyncIterator = AsyncIterator;
  }
})();
