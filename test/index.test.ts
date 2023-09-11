import { describe, it, expect } from "vitest";
import { match, when, matchAsync, whenAsync } from "../src";

async function isEvenAsync(num: number): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(num % 2 === 0), 50));
}

async function isOddAsync(num: number): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(num % 2 !== 0), 50));
}

async function doubleAsync(num: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(num * 2), 50));
}

async function delayUppercaseAsync(str: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(str.toUpperCase()), 50)
  );
}

async function delayIdentityAsync<T>(q: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(q), 50));
}

async function beautifyAsync(str: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(`**~~** ${str} **~~**`), 50)
  );
}

async function stringMatchesAsync(str: string, test: string): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(str === test), 100));
}

describe("match()", () => {
  it("matches by value", () => {
    const x = 69;
    const y = match(x, [
      [420, 111],
      [69, 12],
      [999999, -1],
    ]);
    expect(y).toBe(12);

    const baz = "baz";
    const res = match(baz, [
      ["foo", 111],
      ["bar", 12],
      ["baz", -1],
    ]);
    expect(res).toBe(-1);
  });

  it("matches by function", () => {
    const x = 69;
    const y = match(
      x,
      [
        [(x) => x % 15 === 0, "fizzbuzz"],
        [(x) => x % 3 === 0, "fizz"],
        [(x) => x % 5 === 0, "buzz"],
      ],
      "burp"
    );
    expect(y).toBe("fizz");
  });

  it("matches from a guardlist", () => {
    const flavor = "strawberry";
    const preference = match(
      flavor,
      [
        [["chocolate", "vanilla"], "obviously good"],
        ["pistachio", "lowkey favorite"],
        [["mint chip", "strawberry"], "kinda okay"],
        ["rocky road", "too much going on"],
      ],
      "no opinion"
    );
    expect(preference).toBe("kinda okay");

    const number = 420;
    const goodness = match(
      number,
      [
        [[0, 1, 2, 7], "meh"],
        [[69, 420], "top-tier"],
      ],
      "no opinion"
    );
    expect(goodness).toBe("top-tier");
  });

  it("falls through on no match", () => {
    const me = "toby";
    const res = match(
      me,
      [
        ["jenny", "oops"],
        ["carl", "uh-oh"],
        ["slim", "no way man"],
      ],
      "wahoo"
    );
    expect(res).toBe("wahoo");
  });

  it("falls through on no matchers", () => {
    const x = "nobody";
    const y = match(x, [], "yup");
    expect(y).toBe("yup");
  });

  it("maps correctly", () => {
    const x = 198;
    const y = match(
      x,
      [
        [(x) => x % 99 == 0, (x) => `${x} bottles of beer on the wall`],
        [(x) => x % 42 == 0, (x) => `the answer to everything is ${x}`],
        [(x) => x % 5 == 0, (x) => `numbers like ${x} bore me`],
      ],
      "uh-oh"
    );
    expect(y).toBe("198 bottles of beer on the wall");
  });

  it("stops at the first match", () => {
    const promiscuous = 10;
    const first = match(promiscuous, [
      [7, "shouldn't go"],
      [10, "yaaas"],
      [50, "shouldn't go"],
      [10, "shouldn't go"],
      [700, "shouldn't go"],
    ]);
    expect(first).toBe("yaaas");
  });

  it("deals with heterogeneous matchers and mappers", () => {
    const promiscuous = 11.5;
    const first = match(promiscuous, [
      [7, () => "dumb function"],
      [
        (x) => x / 5 > 2,
        (x) =>
          `${x} is greater than 10 and its mod-5 value is ${
            x % 5
          }, is that weird?`,
      ],
      [() => false, "shouldn't go"],
      [(x) => x < 0.1, "quite small"],
      [700, "nope"],
    ]);
    expect(first).toBe(
      "11.5 is greater than 10 and its mod-5 value is 1.5, is that weird?"
    );
  });

  it("deals correctly with boolean inputs", () => {
    const inpt = false;
    const res = match<boolean, string | { value: string }>(inpt, [
      [() => false, (v) => ({ value: `${v}` })],
      [() => !77, "false"],
      [true, "at first weirdly, but correctly, no"],
      [() => true, "always yes"],
    ]);
    expect(res).toBe("always yes");
  });

  it("even works with non-primitive values", () => {
    const aFunction = () => "not much";
    const res = match<Function, string | boolean>(aFunction, [
      [() => false, () => false],
      [() => !77, false],
      [(x) => x === (() => (7).toString()), "nuh uh"],
      [aFunction, "yes!"],
    ]);
    expect(res).toBe("yes!");
  });
});

describe("matchAsync()", () => {
  it("matches an async guard", async () => {
    await expect(
      matchAsync(33, [
        [isEvenAsync, "even"],
        [isOddAsync, "odd"],
      ])
    ).resolves.toBe("odd");
  });

  it("maps asynchronously", async () => {
    await expect(
      matchAsync(33, [
        [11, 0],
        [22, 1],
        [33, doubleAsync],
      ])
    ).resolves.toBe(66);
  });

  it("matches and maps asynchronously", async () => {
    await expect(
      matchAsync("PRECIOUS", [
        [
          async (s) => (await delayUppercaseAsync("fabulous")) === s,
          async () => beautifyAsync("FAB"),
        ],
        [
          async (s) => stringMatchesAsync(s, "beautiful"),
          async () => beautifyAsync("BEAU"),
        ],
        [
          async (s) => (await delayUppercaseAsync("precious")) === s,
          beautifyAsync,
        ],
      ])
    ).resolves.toBe("**~~** PRECIOUS **~~**");
  });

  it("handles pending promises", async () => {
    await expect(
      matchAsync("PRECIOUS", [
        [
          delayIdentityAsync(false),
          new Promise((resolve) => setTimeout(() => resolve("errr, no"), 50)),
        ],
        [delayIdentityAsync(false), beautifyAsync("BEAU")],
        [delayIdentityAsync(true), (x) => beautifyAsync(x)],
      ])
    ).resolves.toBe("**~~** PRECIOUS **~~**");
  });

  it("stops at the first match", async () => {
    await expect(
      matchAsync("PRECIOUS", [
        [delayIdentityAsync(true), beautifyAsync],
        [
          async (x) => x === "PRECIOUS",
          async () => {
            throw new Error("should not run past first match");
          },
        ],
        [
          async () => true,
          async () => {
            throw new Error("should not run past first match");
          },
        ],
      ])
    ).resolves.toBe("**~~** PRECIOUS **~~**");
  });

  it("falls through on no match", async () => {
    await expect(
      matchAsync(
        101.5,
        [
          [async () => false, 0],
          [async () => false, 91291291],
          [async () => false, 77],
        ],
        new Promise<number>((resolve) => setTimeout(() => resolve(43.5), 50))
      )
    ).resolves.toBe(43.5);
  });

  it("falls through on no matchers", async () => {
    await expect(matchAsync(101.5, [], 43.5)).resolves.toBe(43.5);
  });
});

describe("when()", () => {
  it("matches by value", () => {
    when(69, [
      [
        420,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [69, (x) => expect(x).toBe(69)],
      [
        999999,
        () => {
          throw new Error("incorrect match");
        },
      ],
    ]);
  });

  it("matches by function", () => {
    let res;
    when(69, [
      [
        (x) => x % 15 === 0,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        (x) => x % 3 === 0,
        (x) => {
          res = 420;
          expect(x).toBe(69);
        },
      ],
      [
        (x) => x % 5 === 0,
        () => {
          throw new Error("incorrect match");
        },
      ],
    ]);
    expect(res).toBe(420);
  });

  it("falls through on no match", () => {
    let me;
    when(me, [
      [
        "jenny",
        () => {
          me = "oops";
          throw new Error("incorrect match");
        },
      ],
      [
        "carl",
        () => {
          me = "uh-oh";
          throw new Error("incorrect match");
        },
      ],
      [
        "slim",
        () => {
          me = "no way man";
          throw new Error("incorrect match");
        },
      ],
    ]);
    expect(me).toBeUndefined();
  });

  it("falls through on no matchers", () => {
    when(0, []);
    expect(true).toBeTruthy();
  });

  it("stops at the first match in lazy mode", () => {
    let res;
    when(
      "cool",
      [
        [
          "square",
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          "uncool",
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          "cool",
          () => {
            res = "definitely cool";
          },
        ],
        [
          "not cool",
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          "cool",
          () => {
            throw new Error("should not run in lazy match mode");
          },
        ],
      ],
      true
    );
    expect(res).toBe("definitely cool");
  });

  it("executes all matches in greedy mode", () => {
    let count = 0;
    when(
      999,
      [
        [
          111,
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          (x) => x % 3 === 0,
          () => {
            count += 1;
          },
        ],
        [
          (x) => x % 5 === 0,
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          777,
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          999,
          () => {
            count += 1;
          },
        ],
      ],
      false
    );
    expect(count).toBe(2);

    when(7, [
      [7, () => (count += 1)],
      [7, () => (count += 1)],
      [7, () => (count += 1)],
      [
        8,
        () => {
          throw new Error("incorrect match");
        },
      ],
    ]);
    expect(count).toBe(5);
  });

  it("deals with heterogeneous matchers", () => {
    let total = 0;
    when({ val: 42 }, [
      [
        ({ val }) => val === 0,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        () => true,
        ({ val }) => {
          total += val;
        },
      ],
      [
        ({ val }) => val % 8 === 2,
        ({ val }) => {
          total += 8 * val;
        },
      ],
    ]);
    expect(total).toBe(42 * 9);
  });
});

describe("whenAsync()", () => {
  it("matches an async guard", async () => {
    let even: boolean | undefined;
    await whenAsync(33, [
      [
        isEvenAsync,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        isOddAsync,
        () => {
          even = false;
        },
      ],
    ]);
    expect(even).toBe(false);
  });

  it("handles pending promises", async () => {
    let val = "foo";
    await whenAsync("PRECIOUS", [
      [
        delayIdentityAsync(false),
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        delayIdentityAsync(false),
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        delayIdentityAsync(true),
        async () => {
          val = "bar";
        },
      ],
    ]);
    expect(val).toBe("bar");
  });

  it("stops at the first match in lazy mode", async () => {
    let count = 0;

    await whenAsync(
      "PRECIOUS",
      [
        [
          delayIdentityAsync(true),
          async () => {
            count += 1;
          },
        ],
        [
          async (x) => x === "PRECIOUS",
          async () => {
            throw new Error("should not run past first match");
          },
        ],
        [
          async () => true,
          async () => {
            throw new Error("should not run past first match");
          },
        ],
      ],
      true
    );
    expect(count).toBe(1);
  });

  it("executes all matches in greedy mode", async () => {
    let count = 0;
    await whenAsync(
      { fing: 32, doo: "yes" },
      [
        [
          async (o) => o.fing > 30,
          async () =>
            new Promise((resolve) =>
              setTimeout(() => {
                count += 1;
                resolve();
              }, 50)
            ),
        ],
        [
          async (o) => o.doo.includes("y"),
          async () =>
            new Promise((resolve) =>
              setTimeout(() => {
                count += 1;
                resolve();
              }, 50)
            ),
        ],
        [
          async () => false,
          async () =>
            new Promise((resolve) =>
              setTimeout(() => {
                count += 1000;
                resolve();
              }, 50)
            ),
        ],
        [
          async (o) => o.doo.length == 3,
          async () =>
            new Promise((resolve) =>
              setTimeout(() => {
                count += 1;
                resolve();
              }, 50)
            ),
        ],
      ],
      false
    );
    expect(count).toBe(3);
  });

  it("falls through on no match", async () => {
    await whenAsync(89, [
      [
        0,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        1,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        2,
        () => {
          throw new Error("incorrect match");
        },
      ],
      [
        3,
        () => {
          throw new Error("incorrect match");
        },
      ],
    ]);
    expect(true).toBeTruthy();
  });

  it("falls through on no matchers", async () => {
    await whenAsync(0, []);
    expect(true).toBeTruthy();
  });

  it("handles early returns with missing ret", async () => {
    await whenAsync(
      "earlyRet",
      [
        [
          delayIdentityAsync(false),
          () => {
            throw new Error("incorrect match");
          },
        ],
        [
          delayIdentityAsync(false),
          () => {
            throw new Error("incorrect match");
          },
        ],
        [delayIdentityAsync(true), () => {}],
      ],
      true
    );
    expect.assertions(0);

    await whenAsync(
      "earlyRet",
      [
        [delayIdentityAsync(true), () => {}],
        [
          delayIdentityAsync(true),
          () => {
            throw new Error("should not run in lazy more");
          },
        ],
      ],
      true
    );
  });
});
