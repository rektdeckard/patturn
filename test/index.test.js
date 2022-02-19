const { match, when } = require("../dist");

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
    const res = match(inpt, [
      [() => false, (v) => ({ value: `${v}` })],
      [() => !77, "false"],
      [true, "at first weirdly, but correctly, no"],
      [() => true, "always yes"],
    ]);
    expect(res).toBe("always yes");
  });

  it("even works with non-primitive values", () => {
    const aFunction = () => "not much";
    const res = match(aFunction, [
      [() => false, () => false],
      [() => !77, false],
      [(x) => x === (() => (7).toString()), "nuh uh"],
      [aFunction, "yes!"],
    ]);
    expect(res).toBe("yes!");
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
    expect(true);
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
