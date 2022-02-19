<img src="https://github.com/rektdeckard/patturn/blob/main/meta/patturn.png" width="400" align="center" />

# patturn

The missing `match` expression for JavaScript. Use functional pattern matching constructs familiar from languages like Rust to sidestep the limitations of `switch` statements, reduce messy ternary expressions and if/else chains, and assign variables based on arbitrarily complex conditions.

[![NPM](https://img.shields.io/npm/v/patturn.svg?style=flat-square)](https://www.npmjs.com/package/patturn)

[![GitHub stars](https://img.shields.io/github/stars/rektdeckard/patturn?style=flat-square&label=Star)](https://github.com/rektdeckard/patturn)
[![GitHub forks](https://img.shields.io/github/forks/rektdeckard/patturn?style=flat-square&label=Fork)](https://github.com/rektdeckard/patturn/fork)
[![GitHub watchers](https://img.shields.io/github/watchers/rektdeckard/patturn?style=flat-square&label=Watch)](https://github.com/rektdeckard/patturn)
[![Follow on GitHub](https://img.shields.io/github/followers/rektdeckard?style=flat-square&label=Follow)](https://github.com/rektdeckard)

## Installation

```bash
yarn add patturn
```

or

```bash
npm install --save patturn
```

## Match expressions

The `match()` function behaves like a superpowered `switch` statement that returns a value from the matched branch. It accepts a value to match against, an array of matchers, and an optional default (fallthrough) return value:

```ts
const answer = 42;

match(
  answer,
  [
    [0, "zilch"],
    [3, "the magic number"],
    [42, "the meaning of life"],
    [420, "nothing to see here, officer"],
  ],
  "no match"
); // returns "the meaning of life"
```

Each matcher consists of a _guard_ and a _return_. Guards check if a value matches a condition, and returns specify the value to return from the match. Each can be a value, expression, function called with the value, or any combination thereof:

```ts
const name = "benedict";

match(name, [
  ["thomas", "t-bone"],
  [(n) => n.includes("ben"), `${name} cumberbatch?`],
  [(n) => n.length > 8, (_n) => "too long, don't care"],
]); // returns "benedict cumberbatch?"
```

> Note: _guards_ use strict equality, or the boolean return value if a function.

The _return_ types may be heterogeneous, and when using TypeScript can be inferred, or constrained as needed:

```ts
type User = { name: string; id: number };
const me: User = { name: "rekt", id: 32 };

match<User, boolean | null>(me, [
  [(u) => u.id === 1, true],
  [(u) => u.name === "he-who-must-not-be-named", null],
  [(u) => u.id < 1000, true],
  [(u) => u.name === "rekt", false],
]); // returns `true`
```

> Note: ordering of matchers is important -- the first guard to pass is the one used. In the above example, both the third and fourth guards would pass, but the fourth is never run.

## When statements

The `when()` function behaves much like `match()`, but doesn't return a value. It has the added benefit of running lazily, stopping after the first match, or greedily and running through every match. It's also a lot like a `switch`, useful for running side-effects based on complex conditions.

```ts
const album = { artist: "Radiohead", title: "OK Computer", year: 1997 };

when(
  album,
  [
    [
      (a) => a.year >= 1990 && a.year <= 2000,
      (_) => console.log("playing 90's music..."),
    ],
    [(a) => a.artist === "Sisqo", () => process.exit(1)],
    [(a) => a.artist === "Radiohead", () => setVolume(100)],
  ],
  false
);
// - logs "playing 90's music..."
// - blasts volume
```

## License

MIT © [Tobias Fried](https://github.com/rektdeckard)
