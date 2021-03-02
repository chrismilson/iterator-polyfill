import '.'
import * as assert from 'assert'

function* numbers() {
  yield 1
  yield 2
  yield 3
}

async function* asyncNumbers() {
  yield 1
  yield 2
  yield 3
}

const n = numbers

const an = asyncNumbers

async function main() {
  let collected: any = numbers()
    .map((e) => e * 2)
    .take(2)
    .toArray() // [2, 4] ;

  assert.deepStrictEqual(collected, [2, 4])

  collected = await asyncNumbers()
    .filter((e) => !!(e % 2))
    .map((e) => String(e))
    .toArray() // Promise<["1", "3"]>

  assert.deepStrictEqual(collected, ['1', '3'])

  // SYNC ITERATOR TEST
  // .map
  assert.deepStrictEqual(
    n()
      .map((e) => e * 2)
      .toArray(),
    [2, 4, 6]
  )
  // .filter
  assert.deepStrictEqual(
    n()
      .filter((e) => e % 2 === 0)
      .toArray(),
    [2]
  )
  // .take
  assert.deepStrictEqual(n().take(2).toArray(), [1, 2])
  // .drop
  assert.deepStrictEqual(n().drop(1).toArray(), [2, 3])
  // .asIndexedPairs
  assert.deepStrictEqual(n().asIndexedPairs().toArray(), [
    [0, 1],
    [1, 2],
    [2, 3],
  ])
  // .flatMap
  assert.deepStrictEqual(
    n()
      .flatMap((e) => [e, -e])
      .toArray(),
    [1, -1, 2, -2, 3, -3]
  )
  // .find
  assert.deepStrictEqual(
    n().find((e) => e === 2),
    2
  )
  assert.deepStrictEqual(
    n().find((e: number) => e === 4),
    undefined
  )
  // .every
  assert.strictEqual(
    n().every((e) => e > 0),
    true
  )
  assert.strictEqual(
    n().every((e) => e <= 2),
    false
  )
  // .some
  assert.strictEqual(
    n().some((e) => e <= 2),
    true
  )
  assert.strictEqual(
    n().some((e) => e <= 0),
    false
  )
  // .toArray
  assert.deepStrictEqual(n().toArray(), [1, 2, 3])
  // .reduce
  assert.strictEqual(
    n().reduce((acc, val) => acc + val),
    6
  )
  assert.strictEqual(
    n().reduce((acc, val) => acc + val, 0),
    6
  )
  assert.strictEqual(
    n().reduce((acc, val) => acc - val, 0),
    -6
  )
  // .forEach
  assert.deepStrictEqual(n().forEach(console.debug), undefined)

  /// END OF sync iterator tests

  // ASYNC ITERATOR TESTS
  // .map
  assert.deepStrictEqual(
    await an()
      .map((e) => e * 2)
      .toArray(),
    [2, 4, 6]
  )
  // .filter
  assert.deepStrictEqual(
    await an()
      .filter((e) => e % 2 === 0)
      .toArray(),
    [2]
  )
  // .take
  assert.deepStrictEqual(await an().take(2).toArray(), [1, 2])
  // .drop
  assert.deepStrictEqual(await an().drop(1).toArray(), [2, 3])
  // .asIndexedPairs
  assert.deepStrictEqual(await an().asIndexedPairs().toArray(), [
    [0, 1],
    [1, 2],
    [2, 3],
  ])
  // .flatMap
  assert.deepStrictEqual(
    await an()
      .flatMap((e) => [e, -e])
      .toArray(),
    [1, -1, 2, -2, 3, -3]
  )
  // .find
  assert.deepStrictEqual(await an().find((e) => e === 2), 2)
  assert.strictEqual(await an().find((e: number) => e === 4), undefined)
  // .every
  assert.strictEqual(await an().every((e) => e > 0), true)
  assert.strictEqual(await an().every((e) => e <= 2), false)
  // .some
  assert.strictEqual(await an().some((e) => e <= 2), true)
  assert.strictEqual(await an().some((e) => e <= 0), false)
  // .toArray
  assert.deepStrictEqual(await an().toArray(), [1, 2, 3])
  // .reduce
  assert.deepStrictEqual(await an().reduce((acc: number, val) => acc + val), 6)
  assert.deepStrictEqual(await an().reduce((acc, val) => acc + val, 0), 6)
  assert.deepStrictEqual(await an().reduce((acc, val) => acc - val, 0), -6)
  // .forEach
  assert.deepStrictEqual(await an().forEach(console.debug), undefined)

  console.log('All tests passed successfully.')
}

main()
