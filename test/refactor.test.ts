import { describe, it, expect } from "vitest";
import { match, MatchExpression, P } from "../src/refactor";

describe("match", () => {
  describe("patterns", () => {
    it("wildcard", () => {
      const result = match(69)
        .with(420, () => "blaze it")
        .with([30, 60], "degrees")
        .with(P._, "WILD")
        .with(69, "too late")
        .execute();

      expect(result).toBe("WILD");
    });

    it("any", () => {
      const result = match("hello")
        .with("ciao", 34)
        .with("hola", () => 7n)
        .with("bonjour", 1 / 3)
        .with(P.any, 80085)
        .otherwise(0);

      expect(result).toBe(80085);
    });

    it("nullish", () => {
      let nothing;
      expect(
        match(nothing)
          .with(true, { bad: true })
          .with(false, { worse: false })
          .with(P.nullish, { ok: true })
          .execute()
      ).toStrictEqual({ ok: true });
    });

    it("self", () => {
      const r = match("itsamee")
        .with(P.contains("t"), P.self<string>)
        .with(P.number, "mario")
        .with("wahoo", "luigi")
        .execute();
      expect(r).toBe("itsamee");
    });

    it("not", () => {
      const r1 = match(69)
        .with(P.not.number, () => "blaze it")
        .with(P.not.string, "WILD")
        .with([30, 60], "degrees")
        .execute();
      expect(r1).toBe("WILD");

      const r2 = match(69)
        .with(12, "twelve")
        .with(42, "fortytwo")
        .with(P.not.nullish, "sixtynine")
        .otherwise(() => "a jilion");
      expect(r2).toBe("sixtynine");
    });

    it("boolean", () => {
      expect(match(true).with(false, 9).with(P.boolean, 11).execute()).toBe(11);
      expect(
        match(1)
          .with(true as any, 9)
          .with(P.boolean, 11)
          .execute()
      ).toBeUndefined();
    });

    it("truthy", () => {
      expect(
        match(1)
          .with(false as any, 9)
          .with(P.truthy, 11)
          .execute()
      ).toBe(11);

      expect(
        match(0)
          .with(true as any, 9)
          .with(P.truthy, 11)
          .execute()
      ).toBeUndefined();
    });

    it("falsy", () => {
      expect(
        match(0)
          .with(false as any, 9)
          .with(P.falsy, 11)
          .execute()
      ).toBe(11);

      expect(
        match(1)
          .with(true as any, 9)
          .with(P.falsy, 11)
          .execute()
      ).toBeUndefined();
    });

    describe("string", () => {
      it("base case", () => {
        expect(
          match("hello").with("yo", "no").with(P.string, "yes").execute()
        ).toBe("yes");

        expect(
          match(2).with(4, "no").with(P.string, "yes").execute()
        ).toBeUndefined();
      });

      it("includes", () => {
        expect(
          match("dragon")
            .with("crocodile", 0)
            .with("lizard", 1)
            .with(P.string.includes("rag"), 2)
            .execute()
        ).toBe(2);
      });

      it("startsWith", () => {
        expect(
          match("dragon")
            .with("crocodile", 0)
            .with("lizard", 1)
            .with(P.string.startsWith("dr"), 2)
            .execute()
        ).toBe(2);
      });

      it("endsWith", () => {
        expect(
          match("dragon")
            .with("crocodile", 0)
            .with("lizard", 1)
            .with(P.string.endsWith("gon"), 2)
            .execute()
        ).toBe(2);
      });

      it("uppsercase", () => {
        expect(
          match("DRAGON")
            .with("crocodile", 0)
            .with("lizard", 1)
            .with(P.string.uppercase, 2)
            .execute()
        ).toBe(2);
      });

      it("lowercase", () => {
        expect(
          match("dragon")
            .with("crocodile", 0)
            .with("lizard", 1)
            .with(P.string.lowercase, 2)
            .execute()
        ).toBe(2);
      });

      it("numeric", () => {
        expect(
          match("69420")
            .with("1252", 0)
            .with("38568", 1)
            .with(P.string.numeric, 2)
            .execute()
        ).toBe(2);
      });

      it("alphnumeric", () => {
        expect(
          match("dragon99")
            .with("crocodile", 0)
            .with("lizard", 1)
            .with(P.string.alphanumeric, 2)
            .execute()
        ).toBe(2);
      });
    });

    it("regex", () => {
      expect(
        match("yogi")
          .with(P.regex(/^a/), "a___")
          .with(P.regex(/z$/), "___z")
          .with(P.regex(/.o.i/), "_o_i")
          .with(P.regex(/.o/), "_o__")
          .execute()
      ).toBe("_o_i");
    });

    describe("contains", () => {
      it("array", () => {
        expect(match([2, 4, 17]).with(P.contains(4), true).execute()).toBe(
          true
        );
      });

      it("set", () => {
        const dp = new Set(["harder", "better", "faster", "stronger"]);
        const res = match(dp)
          .with([], "nope")
          .with(P.contains("better"), "yep")
          .execute();
        expect(res).toBe("yep");
      });

      it("string", () => {
        expect(
          match("tobias")
            .with(P.contains("z"), "hdog")
            .with(P.array, 3)
            .with(P.contains("obi"), "tobi wan")
            .execute()
        ).toBe("tobi wan");
      });
    });
  });

  describe("number", () => {
    it("base case", () => {
      expect(
        match(23).with(1, "something").with(P.number, "num").execute()
      ).toBe("num");
    });

    it("gt", () => {
      expect(
        match(23).with(1, "something").with(P.number.gt(10), "num").execute()
      ).toBe("num");
    });

    it("gte", () => {
      expect(
        match(23).with(1, "something").with(P.number.gte(23), "num").execute()
      ).toBe("num");
    });

    it("lt", () => {
      expect(
        match(23).with(1, "something").with(P.number.lt(50), "num").execute()
      ).toBe("num");
    });

    it("lte", () => {
      expect(
        match(23).with(1, "something").with(P.number.lte(23), "num").execute()
      ).toBe("num");
    });

    it("between", () => {
      expect(
        match(23)
          .with(1, "something")
          .with(P.number.between(21, 24), "num")
          .execute()
      ).toBe("num");
    });

    it("positive", () => {
      expect(
        match(23).with(1, "something").with(P.number.positive, "num").execute()
      ).toBe("num");
    });

    it("negative", () => {
      expect(
        match(-23).with(1, "something").with(P.number.negative, "num").execute()
      ).toBe("num");
    });

    it("finite", () => {
      expect(
        match(-23).with(1, "something").with(P.number.finite, "num").execute()
      ).toBe("num");
      expect(
        match(Infinity)
          .with(1, "something")
          .with(P.number.finite, "num")
          .execute()
      ).toBeUndefined();
    });

    it("int", () => {
      expect(
        match(-23).with(1, "something").with(P.number.int, "num").execute()
      ).toBe("num");
      expect(
        match(23.2).with(1, "something").with(P.number.int, "num").execute()
      ).toBeUndefined();
    });
  });

  describe("bigint", () => {
    it("base case", () => {
      expect(
        match(23n).with(1n, "something").with(P.bigint, "num").execute()
      ).toBe("num");
    });

    it("gt", () => {
      expect(
        match(23n).with(1n, "something").with(P.bigint.gt(10), "num").execute()
      ).toBe("num");
    });

    it("gte", () => {
      expect(
        match(23n).with(1n, "something").with(P.bigint.gte(23), "num").execute()
      ).toBe("num");
    });

    it("lt", () => {
      expect(
        match(23n).with(1n, "something").with(P.bigint.lt(50), "num").execute()
      ).toBe("num");
    });

    it("lte", () => {
      expect(
        match(23n).with(1n, "something").with(P.bigint.lte(23), "num").execute()
      ).toBe("num");
    });

    it("between", () => {
      expect(
        match(23n)
          .with(1n, "something")
          .with(P.bigint.between(21n, 24n), "num")
          .execute()
      ).toBe("num");
    });

    it("positive", () => {
      expect(
        match(23n)
          .with(1n, "something")
          .with(P.bigint.positive, "num")
          .execute()
      ).toBe("num");
    });

    it("negative", () => {
      expect(
        match(-23n)
          .with(1n, "something")
          .with(P.bigint.negative, "num")
          .execute()
      ).toBe("num");
    });
  });

  describe("func", () => {
    it("base case", () => {
      expect(
        match(() => "yay")
          .with(P.number, false)
          .with("yay", false)
          .with(P.func, true)
          .execute()
      ).toBe(true);
    });

    it("arity", () => {
      expect(
        match((_foo: number, _bar: boolean) => "yay")
          .with(P.number, false)
          .with(P.func.arity(3), false)
          .with(P.func.arity(2), true)
          .execute()
      ).toBe(true);
    });
  });

  it("symbol", () => {
    const magic = Symbol.for("magic");
    expect(
      match(magic)
        .with("magic" as any, "no")
        .with(Symbol("magic") as any, "still no")
        .with(P.symbol, "yes")
        .execute()
    ).toBe("yes");
  });

  describe("object", () => {
    it("can match by type", () => {
      const test = { foo: 7, bar: { qux: true, quz: "yeah" } };
      const res = match(test)
        .with(P.boolean, 1)
        .with(P.number, 2)
        .with(P.array, 3)
        .with(P.object, 4)
        .with(P.func, 5)
        .execute();

      expect(res).toBe(4);
    });

    it("can match a partial", () => {
      const test = { foo: 7, bar: { qux: true, quz: "yeah" } };
      const res = match(test)
        .with({ foo: 5 }, 1)
        .with({ foo: P.string }, 2)
        .with({ bar: { qux: [false] } }, 3)
        .with({ foo: [5, P.number] }, 4)
        .with({ bar: { quz: P.string } }, 5)
        .execute();

      expect(res).toBe(4);
    });

    it("can match against complex partials", () => {
      const test = {
        name: "john",
        occupation: { field: "accounting", salary: 120000 },
        married: false,
      };

      const res = match(test)
        .with(
          {
            name: P.regex(/^j/),
            married: false,
            occupation: { field: P.truthy, salary: P.number.gt(100000) },
          },
          "what a catch"
        )
        .execute();
      expect(res).toBe("what a catch");
    });

    it("can match against negative partials", () => {
      const test = {
        name: "john",
        occupation: { field: "accounting", salary: 120000 },
        married: false,
      };

      const res = match(test)
        .with({ name: P.not.regex(/^j/) }, "i hate j names")
        .with({ occupation: { field: P.not.falsy } }, "gotta have job")
        .execute();
      expect(res).toBe("gotta have job");
    });
  });

  describe("array", () => {
    it("base case", () => {
      const test = [1, 2, 3];
      const res = match(test)
        .with({}, (s) => s[1])
        .with(P.array, 69)
        .execute();

      expect(res).toBe(69);
    });
  });

  describe("instanceOf", () => {
    it("base case", () => {
      const d1 = new Date();
      expect(
        match(d1)
          .with(P.instanceOf(RegExp), false)
          .with(P.instanceOf(WeakMap), false)
          .with(P.instanceOf(Date), true)
          .execute()
      ).toBe(true);
    });
  });
});

describe("types", () => {
  it("narrows correctly", () => {
    type Text = { type: "text"; data: string };
    type Img = { type: "img"; data: { src: string; alt: string } };
    type Video = {
      type: "video";
      data: { src: string; format: "mp4" | "webm" };
    };

    type Content = Text | Img | Video;

    const formatContent = (content: Content) =>
      match(content)
        .with({ type: "text" }, ({ data }) => `<p>${data}</p>`)
        .with(
          { type: "img" },
          ({ data }) =>
            `<img src="${(data as Img["data"]).src}" alt="${
              (data as Img["data"]).alt
            }" />`
        )
        .with(
          { type: "video" },
          ({ data }) =>
            `<img src="${(data as Video["data"]).src}" format="${
              (data as Video["data"]).format
            }" />`
        )
        .with([{ type: "img" }, { type: "video" }], () => "img or video")
        .execute();

    expect(formatContent({ type: "img", data: { src: "foo", alt: "" } })).toBe(
      `<img src="foo" alt="" />`
    );
  });
});

describe("MatchExpression", () => {
  describe("prepare", () => {
    it("can be constructed beforehand and executed multiple times", () => {
      const expr = MatchExpression.prepare()
        .with([3, 4], "yes")
        .with([5, 9, 11], "superyes")
        .with("fortytwo", "no")
        .with(P.number, "wow")
        .with(P.bigint, "huuuuuuge");

      expect(expr.execute(12)).toBe("wow");
      expect(expr.execute(9)).toBe("superyes");
      expect(expr.execute(99999999999999n)).toBe("huuuuuuge");
    });
  });
});