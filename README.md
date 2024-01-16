<p align="center">
  <img src="https://github.com/rektdeckard/patturn/blob/main/meta/patturn_hero.png" width="400" align="center" />
</p>

# patturn

The missing `match` expression for JavaScript. Use functional pattern matching constructs familiar from languages like Rust to sidestep the limitations of `switch` statements, reduce messy ternary expressions and if/else chains, and assign variables based on arbitrarily complex conditions.

[![NPM](https://img.shields.io/npm/v/patturn.svg?style=flat-square)](https://www.npmjs.com/package/patturn)
![npm bundle size](https://img.shields.io/bundlephobia/minzip/patturn?style=flat-square)

[![GitHub stars](https://img.shields.io/github/stars/rektdeckard/patturn?style=flat-square&label=Star)](https://github.com/rektdeckard/patturn)
[![GitHub forks](https://img.shields.io/github/forks/rektdeckard/patturn?style=flat-square&label=Fork)](https://github.com/rektdeckard/patturn/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/rektdeckard/patturn?style=flat-square&label=Watch)](https://github.com/rektdeckard/patturn)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Installation

```bash
npm install patturn
#^ Or whatever package manager you use
```

## Match Expressions

The `match` function behaves like a superpowered `switch` statement that returns a value from the matched branch. It accepts a value to match against, and any number of match arms. When executed it returns the value in the matched arm.

```ts
import { match } from "patturn";

const answer = 42;
const result = match(answer)
  .with(0, "zilch")
  .with(3, "the magic number")
  .with(42, "the meaning of life")
  .with(420, "nothing to see here, officer")
  .execute(); // "the meaning of life"
```

The _return_ types may be heterogeneous, and when using TypeScript, they also serve to constrain the test value's type on success. can be inferred, or constrained as needed.

### Guards and Returns

Each match arm (calls to `with`) consists of a _guard_ and a _return_. Guards check if a value matches a condition, and returns specify the value to return from the match. Guards can be a value, [Pattern](#patterns), array of values, a function returning a boolean, or any combination thereof:

```ts
const name = "benedict";

match(name)
  .with("thomas", "t-bone")
  .with((n) => n.includes("ben"), `${name} cumberbatch?`)
  .with(
    (n) => n.length > 8,
    (n) => n.length
  )
  .execute(); // "benedict cumberbatch?"
```

> Note: _guards_ use strict equality checks when the value is primitive, or the boolean return value if a function.

Matching a non-primitive value like an Object, Array, or class instance comes in a few flavors. To loosely match objects with certain properties, a simple guard object will suffice. Loose matching only requires that properties on the guard match properties on the test value, not vice-versa. For strict object matching where all own enumerable properties are matched, use [P.object](#p.object) and associated patterns. To match an array, use [P.array](#p.array) and associated patterns (array literals behave like "any of these" — see [Guard Lists](#guard-lists)):

```ts
import { match, P } from "patturn";

const testval = { foo: true, bar: [1, 2, 3], baz: "hello world" };

match(testval)
  .with({ foo: false }, "no")
  .with({ foo: true, bar: P.array.of(P.number) }, "yep") // <-- matches!
  .with(P.object.strict({ baz: "hello world" }), "nope")
  .execute(); // "yep"
```

#### Guard Lists

To match multiple possible values in a single match branch, simply pass in an array of values as the guard. This is the equivalent of the fallthrough behavior in `switch`, and any matching value will immediately break with the associated return:

```ts
const flavor = "strawberry";

const preference = match(flavor)
  .with(["chocolate", "vanilla"], "obviously good")
  .with(["mint chip", "strawberry"], "kinda okay") // <-- matches!
  .with("pistachio", "lowkey favorite")
  .with("rocky road", "too much going on")
  .execute(); // "kinda okay"
```

#### Order Matters

Ordering of matchers is important -- the first guard to pass is the one used. In the example below, both the third and fourth guards would pass, but the fourth is never run:

```ts
type User = { name: string; id: number };
const me: User = { name: "rekt", id: 32 };

match(me)
  .with((u) => u.id === 1, true)
  .with((u) => u.name === "he-who-must-not-be-named", null)
  .with((u) => u.id < 1000, "yes") // <-- matches first!
  .with((u) => u.name === "rekt", false)
  .execute(); // "yes"
```

#### Return expressions

You may provide a literal return value in a match arm, or supply a function to be called with the match value to produce a return value. This is useful to keep matching and transforming logic collocated, while saving work due to the lazy nature of match arms:

```ts
const testval = ["age", "quod", "agis"];

match(testval)
  .with(P.array.len(2), (arr) => arr[0])
  .with(300, (n) => n ** 2)
  .with(P.array.of(P.string), (arr) => arr.map((str) => str.toUpperCase()))
  .execute(); // ["AGE", "QUOD", "AGIS"]
```

---

## Patterns

Patterns are simple data validation functions that return `true` if the given input matches, otherwise `false`. Some Patterns have additional, chainable predicates that help refine and constrain validation. In TypeScript, they also serve to constrain the test value's type on success. Patterns live on the `P` object

### `P._`

The wildcard pattern, this function matches any input and always returns `true` no matter the input. It is also available under the alias `P.any`.

### `P.nullish`

Matches `null` or `undefined` inputs.

### `P.boolean`

Matches `boolean` primitives and `Boolean` objects.

#### Examples

```ts
P.boolean(true); // true
P.boolean(false); // true
P.boolean(new Boolean()); // true
P.boolean("true"); // false
```

### `P.falsy`

Matches any falsy value, namely `false`, `undefined`, `null`, `0`, `-0`, `NaN`, and `""` (the empty string).

### `P.truthy`

Matches any truthy value, namely all values other than `false`, `undefined`, `null`, `0`, `-0`, `NaN`, and `""` (the empty string).

### `P.string`

Matches `string` primitives and `String` objects.

#### Modifiers

- `P.string.includes(substr: string)`: string includes a given `substr`
- `P.string.startsWith(prefix: string)`: string starts with a given `prefix`
- `P.string.endsWith(suffix: string)`: string starts with a given `suffix`
- `P.string.uppercase`: string contains only uppercase alphabetic characters
- `P.string.lowercase`: string contains only lowercase alphabetic characters
- `P.string.alphabetic`: string contains only alphabetic characters
- `P.string.alphanumeric`: string contains only alphanumeric characters
- `P.string.numeric`: string contains only numeric characters
- `P.string.url`: string is a `string` representation of a valid `URL` (including protocol)
  - `P.string.url.loose`: string is a `string` URL representation which may or may not have a `protocol`
- `P.string.enum(values: string[])`: string is one of a finite set of `values`
- `P.string.len(len: number | [min: number | null, max?: number | null])`: string is a `string` of length `len`, or between `min` and `max` characters in length (inclusive) if `len` is a tuple.

#### Examples

```ts
P.string("mario"); // true
P.string(new String("mario")); // true
P.string.includes("a")("mario"); // true
P.string.startsWith("a")("mario"); // false
P.string.endsWith("o")("mario"); // true
P.string.uppercase("mario"); // false
P.string.lowercase("mario"); // true
P.string.alphabetic("mario"); // true
P.string.alphanumeric("mario"); // true
P.string.numeric("mario"); // false
P.string.url("mario.com"); // false
P.string.url.loose("mario.com"); // true
P.string.enum(["mario", "luigi", "toad"])("mario"); // true
P.string.len(10)("mario"); // false
P.string.len([3, 10])("mario"); // true
```

### `P.regex`

### `P.number`

### `P.bigint`

### `P.symbol`

### `P.object`

### `P.array`

### `P.tuple`

### `P.function`

### `P.contains`

### `P.union`

### `P.intersection`

### `P.instanceOf`

### Modifiers

## Async Match Expressions

For cases when asynchronous checks or return mappings are needed, use the `matchAsync` function as you would `match`. As with the sync form, cases are evaluated lazily in sequence. It handles the same synchronous guards and returns, as well as Promises and async functions:

```ts
import { matchAsync } from "patturn";

const signupState = await matchAsync({
  username: "something_rude",
  email: "person@domain.com",
})
  .with({ username: "", email: "" }, SignupState.Empty) // ✔ value
  .with(isEmailInvalid, SignupState.EmailInvalid) // ✔ sync fn
  .with(isUsernameInvalid, SignupState.UsernameInvalid) // ✔ async fn
  .with(Promise.resolve(false), SignupState.Never) // ✔ promise
  .otherwise(SignupState.Ok);
```

---

## When statements

The `when` function behaves much like `match`, but doesn't return a value. It has the added option of running lazily, stopping after the first match, or greedily (exhaustively) and running through every match. It's also a lot like a `switch`, useful for running side-effects based on complex conditions.

```ts
const album = { artist: "Radiohead", title: "OK Computer", year: 1997 };

when(album)
  .is({ year: P.number.between(1990, 2000) }, (_) =>
    console.log("playing 90's music...")
  )
  .is(
    (a) => a.artist === "Sisqo",
    () => process.exit(1)
  )
  .is(
    (a) => a.artist === "Radiohead",
    () => setVolume(100)
  )
  .lazy();

// - logs "playing 90's music..."
```

### Early Returns

Sometimes you want to break out of pattern matching early, without running any side-effects or responding in any particular way. In this case, just omit the handler from the matcher and use lazy matching. This is analagous to a `switch` arm with only a `break` statement:

```ts
when(23)
  .is(42, submitAnswer)
  .is(
    (n) => n % 9 === 0,
    (n) => bottleBeers(n + 1)
  )
  .is(isPrime) // early return with no operation to perform
  .is(600) // early return with no operation to perform
  .is(-1, doSomething)
  .otherwise(fallback); // must be exhaustive
```

---

## Async When statements

As expected, the async form `whenAsync` can match and run arbitrary patterns, Promises, and async functions:

```ts
import { whenAsync } from "patturn";

await whenAsync(33)
  .is(101, () => console.log("needs help"))
  .is(isPrimeAsync, handlePrimeCase)
  .is(
    async (n) => longComputationReturningBool,
    (n) => handlePass(n, "xyz")
  )
  .lazy();
```

## License

MIT © [Tobias Fried](https://github.com/rektdeckard)
