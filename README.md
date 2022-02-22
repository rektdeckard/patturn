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
yarn add patturn
```

or

```bash
npm install --save patturn
```

## Match Expressions

The `match` function behaves like a superpowered `switch` statement that returns a value from the matched branch. It accepts a value to match against, an array of matchers, and an optional default return value.

```ts
import { match } from "patturn";

const ANSWER = 42;

const result = match(
  ANSWER,
  [
    [0, "zilch"],
    [3, "the magic number"],
    [42, "the meaning of life"],
    [420, "nothing to see here, officer"],
  ],
  "no match"
);
// result: "the meaning of life"
```

The _return_ types may be heterogeneous, and when using TypeScript can be inferred, or constrained as needed.

### Guards and Returns

Each matcher consists of a _guard_ and a _return_. Guards check if a value matches a condition, and returns specify the value to return from the match. Each can be a value, expression, array of values, function called with the value, or any combination thereof:

```ts
const name = "benedict";

match(name, [
  ["thomas", "t-bone"],
  [(n) => n.includes("ben"), `${name} cumberbatch?`],
  [(n) => n.length > 8, (_n) => "too long, don't care"],
]); // returns "benedict cumberbatch?"
```

> Note: _guards_ use strict equality, or the boolean return value if a function.

### Guard Lists

To match multiple values in a single match branch, simply pass in an array of values as the guard. This is the equivalent of the fallthrough behavior in `switch`, and any matching value will immediately break with the associated return:

```ts
const flavor = "strawberry";

const preference = match(
  flavor,
  [
    [["chocolate", "vanilla"], "obviously good"],
    [["mint chip", "strawberry"], "kinda okay"], // matches second guard case
    ["pistachio", "lowkey favorite"],
    ["rocky road", "too much going on"],
  ],
  "no opinion"
);
// preference: "kinda okay"
```

### Order Matters

Ordering of matchers is important -- the first guard to pass is the one used. In the example below, both the third and fourth guards would pass, but the fourth is never run:

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

### Function Signature

```ts
function match<In, Out = In>(
  input: In,
  matchers: Array<MatchBranch<In, Out>>,
  defaultValue?: Out
): Out | undefined;

type MatchBranch<In, Out> = [Guard<In>, Return<In, Out>];
type Guard<In> = In | In[] | ((input: In) => boolean);
type Return<In, Out> = Out | ((input: In) => Out);
```

---

## Async Match Expressions

For cases when asynchronous checks or return mappings are needed, use the `matchAsync` function as you would `match`. As with the sync form, cases are evaluated lazily in sequence. It handles the same synchronous guards and returns, as well as Promises and async functions:

```ts
import { matchAsync } from "patturn";

const formState = await matchAsync(
  { username: "something_rude", email: "person@domain.com" },
  [
    [{ username: "", email: "" }, SignupState.Empty],              // ✔ value
    [isEmailInvalid, SignupState.EmailInvalid],                    // ✔ sync fn
    [isEmailTaken, SignupState.EmailTaken],                        // ✔ async fn (api call)
    [isUsernameInvalid, SignupState.UsernameInvalid],              // ✔ async fn
    [isUsernameObscene, SignupState.UsernameDisallowed],           // ✔ async fn
    [new Promise((resolve) => resolve(false)), SignupState.Never], // ✔ promise
    [async () => false), SignupState.Never],                       // ✔ anonymous async fn
  ],
  SignupState.Ok
);
```

### Function Signature

```ts
async function matchAsync<In, Out = In>(
  input: In,
  matchers: Array<MatchBranchAsync<In, Out>>,
  defaultValue?: Out
): Promise<Out | undefined>;

type MatchBranchAsync<In, Out> = [GuardAsync<In>, ReturnAsync<In, Out>];
type GuardAsync<In> =
  | Guard<In>
  | Promise<boolean>
  | ((input: In) => Promise<boolean>);
type ReturnAsync<In, Out> = Return<In, Out> | ((input: In) => Promise<Out>);
```

---

## When statements

The `when` function behaves much like `match`, but doesn't return a value. It has the added option of running lazily, stopping after the first match, or greedily and running through every match. It's also a lot like a `switch`, useful for running side-effects based on complex conditions.

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
);
// (greedy by default)
// - logs "playing 90's music..."
// - blasts volume
```

### Early Returns

Sometimes you want to break out of pattern matching early, without running any side-effects or responding in any particular way. In this case, just omit the handler from the matcher and use lazy matching. This is analagous to a `switch` arm with only a `break` statement:

```ts
when(
  23,
  [
    [42, submitAnswer],
    [(n) => n % 9 === 0), (n) => bottleBeers(n + 1)],
    [isPrime], // early return with no operation to perform
    [600],     // early return with no operation to perform
    [-1, doSomething],
  ],
  true,        // must be lazy
);
```

### Function Signature

```ts
function when<In>(
  input: In,
  matchers: Array<WhenBranch<In>>,
  lazy?: boolean
): void;

type WhenBranch<In> = [Guard<In>, ((input: In) => void) | null | undefined];
type Guard<In> = In | In[] | ((input: In) => boolean);
```

---

## Async When statements

As expected, the async form `whenAsync` can match and run arbitrary patterns, Promises, and async functions:

```ts
import { whenAsync } from "patturn";

await whenAsync(33, [
  [101, () => console.log("needs help")],
  [isPrimeAsync, handlePrimeCase],
  [async (n) => longComputationReturningBool, (n) => handlePass(n, "xyz")],
]);
```

### Function Signature

```ts
async function whenAsync<In>(
  input: In,
  matchers: Array<WhenBranchAsync<In>>,
  lazy: boolean = false
): Promise<void>;

type WhenBranchAsync<In> = [
  GuardAsync<In>,
  ((input: In) => void | Promise<void>) | null | undefined
];
type GuardAsync<In> =
  | Guard<In>
  | Promise<boolean>
  | ((input: In) => Promise<boolean>);
```

## License

MIT © [Tobias Fried](https://github.com/rektdeckard)
