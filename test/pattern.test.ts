import { describe, expect, it, vi } from "vitest";
import { P } from "../src";

describe("P", () => {
  describe("prepared", () => {
    it("prepare", () => {
      const contacts = P.array.of({
        age: P.number,
        location: { city: P.string.alphabetic, state: P.string.uppercase },
      });

      expect(
        contacts([{ age: 27, location: { city: "Denver", state: "CO" } }])
      ).toBe(true);
    });
  });

  describe("any", () => {
    it("matches everything", () => {
      expect(P.any(5)).toBe(true);
      expect(P.any(false)).toBe(true);
      expect(P.any(null)).toBe(true);
      expect(P._([])).toBe(true);
      expect(P._(NaN)).toBe(true);
      expect(P._({ foo: NaN })).toBe(true);
    });
  });

  describe("nullish", () => {
    it("matches nullish", () => {
      expect(P.nullish(null)).toBe(true);
      expect(P.nullish(undefined)).toBe(true);
    });

    it("does not match non-nullish", () => {
      expect(P.nullish(0)).toBe(false);
      expect(P.nullish(false)).toBe(false);
      expect(P.nullish(NaN)).toBe(false);
      expect(P.nullish("")).toBe(false);
      expect(P.nullish({})).toBe(false);
    });
  });

  describe("boolean", () => {
    it("matches boolean primitives and objects", () => {
      expect(P.boolean(true)).toBe(true);
      expect(P.boolean(false)).toBe(true);
      expect(P.boolean(new Boolean())).toBe(true);
      expect(P.boolean(new Boolean(true))).toBe(true);
    });

    it("does not match non-boolean", () => {
      expect(P.boolean(0)).toBe(false);
      expect(P.boolean(1)).toBe(false);
      expect(P.boolean(NaN)).toBe(false);
      expect(P.boolean(undefined)).toBe(false);
      expect(P.boolean(null)).toBe(false);
      expect(P.boolean({})).toBe(false);
      expect(P.boolean([{}])).toBe(false);
      expect(P.boolean("no")).toBe(false);
    });
  });

  describe("truthy", () => {
    it("matches truthy", () => {});
    it("does not match falsy", () => {});
  });

  describe("falsy", () => {
    it("matches falsy", () => {});
    it("does not match truthy", () => {});
  });

  describe("string", () => {
    it("matches string primitives and objects", () => {
      expect(P.string("")).toBe(true);
      expect(P.string("hello")).toBe(true);
      expect(P.string(new String())).toBe(true);
      expect(P.string(new String("hello"))).toBe(true);
    });

    it("does not match non-string", () => {
      expect(P.string(0)).toBe(false);
      expect(P.string(1)).toBe(false);
      expect(P.string(NaN)).toBe(false);
      expect(P.string(undefined)).toBe(false);
      expect(P.string(null)).toBe(false);
      expect(P.string({})).toBe(false);
      expect(P.string([{}])).toBe(false);
    });

    describe("includes", () => {
      it("matches when string includes target", () => {
        expect(P.string.includes("el")("hello")).toBe(true);
        expect(P.string.includes("el")(new String("hello"))).toBe(true);
      });

      it("does not match non-strings and non-inclusive strings", () => {
        expect(P.string.includes("xq")("hello")).toBe(false);
        expect(P.string.includes("xq")(new String("hello"))).toBe(false);
        expect(P.string.includes("xq")(NaN)).toBe(false);
        expect(P.string.includes("xq")(undefined)).toBe(false);
        expect(P.string.includes("xq")("")).toBe(false);
        expect(P.string.includes("xq")({})).toBe(false);
        expect(P.string.includes("xq")([{}])).toBe(false);
      });
    });

    describe("startsWith", () => {
      it("matches when string starts with target", () => {
        expect(P.string.startsWith("he")("hello")).toBe(true);
        expect(P.string.startsWith("he")(new String("hello"))).toBe(true);
      });

      it("does not match non-strings and non-prefixed strings", () => {
        expect(P.string.startsWith("xq")("hello")).toBe(false);
        expect(P.string.startsWith("xq")(new String("hello"))).toBe(false);
        expect(P.string.startsWith("xq")(NaN)).toBe(false);
        expect(P.string.startsWith("xq")(undefined)).toBe(false);
        expect(P.string.startsWith("xq")("")).toBe(false);
        expect(P.string.startsWith("xq")({})).toBe(false);
        expect(P.string.startsWith("xq")([{}])).toBe(false);
      });
    });

    describe("endsWith", () => {
      it("matches when string starts with target", () => {
        expect(P.string.endsWith("lo")("hello")).toBe(true);
        expect(P.string.endsWith("lo")(new String("hello"))).toBe(true);
      });

      it("does not match non-strings and non-suffixed strings", () => {
        expect(P.string.endsWith("xq")("hello")).toBe(false);
        expect(P.string.endsWith("xq")(new String("hello"))).toBe(false);
        expect(P.string.endsWith("xq")(NaN)).toBe(false);
        expect(P.string.endsWith("xq")(undefined)).toBe(false);
        expect(P.string.endsWith("xq")("")).toBe(false);
        expect(P.string.endsWith("xq")({})).toBe(false);
        expect(P.string.endsWith("xq")([{}])).toBe(false);
      });
    });

    describe("uppercase", () => {
      it("matches when string is uppercase", () => {
        expect(P.string.uppercase("HELLO")).toBe(true);
        expect(P.string.uppercase(new String("HELLO"))).toBe(true);
        expect(P.string.uppercase("")).toBe(true);
      });

      it("does not match non-strings and non-uppercase strings", () => {
        expect(P.string.uppercase("hello")).toBe(false);
        expect(P.string.uppercase(new String("Hello"))).toBe(false);
        expect(P.string.uppercase(NaN)).toBe(false);
        expect(P.string.uppercase(undefined)).toBe(false);
        expect(P.string.uppercase({})).toBe(false);
        expect(P.string.uppercase([{}])).toBe(false);
      });
    });

    describe("lowercase", () => {
      it("matches when string is lowercase", () => {
        expect(P.string.lowercase("hello")).toBe(true);
        expect(P.string.lowercase(new String("hello"))).toBe(true);
        expect(P.string.lowercase("")).toBe(true);
      });

      it("does not match non-strings and non-lowercase strings", () => {
        expect(P.string.lowercase("HELLO")).toBe(false);
        expect(P.string.lowercase(new String("Hello"))).toBe(false);
        expect(P.string.lowercase(NaN)).toBe(false);
        expect(P.string.lowercase(undefined)).toBe(false);
        expect(P.string.lowercase({})).toBe(false);
        expect(P.string.lowercase([{}])).toBe(false);
      });
    });

    describe("numeric", () => {
      it("matches when string is numeric", () => {
        expect(P.string.numeric("13461346")).toBe(true);
        expect(P.string.numeric(new String("13461346"))).toBe(true);
        expect(P.string.numeric("")).toBe(true);
      });

      it("does not match non-strings and non-numeric strings", () => {
        expect(P.string.numeric("hello")).toBe(false);
        expect(P.string.numeric(new String("Hello"))).toBe(false);
        expect(P.string.numeric(NaN)).toBe(false);
        expect(P.string.numeric(undefined)).toBe(false);
        expect(P.string.numeric({})).toBe(false);
        expect(P.string.numeric([{}])).toBe(false);
      });
    });

    describe("alphabetic", () => {
      it("matches when string is alphabetic", () => {
        expect(P.string.alphabetic("hello")).toBe(true);
        expect(P.string.alphabetic(new String("hello"))).toBe(true);
        expect(P.string.alphabetic("")).toBe(true);
      });

      it("does not match non-strings and non-alphabetic strings", () => {
        expect(P.string.alphabetic("3452HELLO")).toBe(false);
        expect(P.string.alphabetic(new String("3452HELLO"))).toBe(false);
        expect(P.string.alphabetic(NaN)).toBe(false);
        expect(P.string.alphabetic(undefined)).toBe(false);
        expect(P.string.alphabetic({})).toBe(false);
        expect(P.string.alphabetic([{}])).toBe(false);
      });
    });

    describe("alphanumeric", () => {
      it("matches when string is alphanumeric", () => {
        expect(P.string.alphanumeric("3452HELLO")).toBe(true);
        expect(P.string.alphanumeric(new String("3452HELLO"))).toBe(true);
        expect(P.string.alphanumeric("")).toBe(true);
      });

      it("does not match non-strings and non-alphanumeric strings", () => {
        expect(P.string.alphanumeric("+@#)(")).toBe(false);
        expect(P.string.alphanumeric(new String("+@#)("))).toBe(false);
        expect(P.string.alphanumeric(NaN)).toBe(false);
        expect(P.string.alphanumeric(undefined)).toBe(false);
        expect(P.string.alphanumeric({})).toBe(false);
        expect(P.string.alphanumeric([{}])).toBe(false);
      });
    });

    describe("url", () => {
      it("matches when string is url", () => {
        expect(P.string.url("https://phosphoricons.com")).toBe(true);
        expect(P.string.url(new String("wss://www.example.com/s"))).toBe(true);
      });

      it("does not match non-strings and non-url strings", () => {
        expect(P.string.url("")).toBe(false);
        expect(P.string.url("phosphoricons.com")).toBe(false);
        expect(P.string.url(new String("+@#)("))).toBe(false);
        expect(P.string.url(NaN)).toBe(false);
        expect(P.string.url(undefined)).toBe(false);
        expect(P.string.url({})).toBe(false);
        expect(P.string.url([{}])).toBe(false);
      });

      describe("loose", () => {
        it("matches when string is url-like", () => {
          expect(P.string.url.loose("https://phosphoricons.com")).toBe(true);
          expect(P.string.url.loose(new String("wss://ex.co/s"))).toBe(true);
          expect(P.string.url.loose("phosphoricons.com")).toBe(true);
        });

        it("does not match non-strings and non-url-like strings", () => {
          expect(P.string.url.loose("")).toBe(false);
          expect(P.string.url.loose(new String("+@#)("))).toBe(false);
          expect(P.string.url.loose(NaN)).toBe(false);
          expect(P.string.url.loose(undefined)).toBe(false);
          expect(P.string.url.loose({})).toBe(false);
          expect(P.string.url.loose([{}])).toBe(false);
        });
      });
    });

    describe("enum", () => {
      const states = ["draft", "pending", "published", "archived"];

      it("matches when string is enum member", () => {
        expect(P.string.enum(states)("draft")).toBe(true);
        expect(P.string.enum(states)("published")).toBe(true);
        expect(P.string.enum(states)(new String("published"))).toBe(true);
      });

      it("does not match non-strings and non-member strings", () => {
        expect(P.string.enum(states)("")).toBe(false);
        expect(P.string.enum(states)("phosphoricons.com")).toBe(false);
        expect(P.string.enum(states)(new String("+@#)("))).toBe(false);
        expect(P.string.enum(states)(NaN)).toBe(false);
        expect(P.string.enum(states)(undefined)).toBe(false);
        expect(P.string.enum(states)({})).toBe(false);
        expect(P.string.enum(states)([{}])).toBe(false);
      });
    });

    describe("regex", () => {
      const _x__ = /.x../;
      const isoDate = /^\d\d\d\d-\d\d-\d\d/;

      it("matches strings with target pattern", () => {
        expect(P.string.regex(/.*e$/)("axle")).toBe(true);
        expect(P.string.regex(_x__)(new String("axle"))).toBe(true);
        expect(P.string.regex(isoDate)("2023-01-01")).toBe(true);
      });

      it("does not match non-strings and strings without target", () => {
        expect(P.string.regex(/z/)("abc")).toBe(false);
        expect(P.string.regex(/z/)(new String("+@#)("))).toBe(false);
        expect(P.string.regex(/z/)(NaN)).toBe(false);
        expect(P.string.regex(/z/)(undefined)).toBe(false);
        expect(P.string.regex(/z/)({})).toBe(false);
        expect(P.string.regex(/z/)([{}])).toBe(false);
      });
    });

    describe("len", () => {
      it("matches when string is exact length", () => {
        expect(P.string.len(4)("rekt")).toBe(true);
        expect(P.string.len(4)(new String("rekt"))).toBe(true);
        expect(P.string.len(0)(new String(""))).toBe(true);
      });

      it("matches when string is in length range", () => {
        expect(P.string.len([1, 5])("rekt")).toBe(true);
        expect(P.string.len([3])(new String("rekt"))).toBe(true);
        expect(P.string.len([7, 100])("beelzebub")).toBe(true);
      });

      it("does not match non-strings and strings of invalid length", () => {
        expect(P.string.len(5)("")).toBe(false);
        expect(P.string.len(5)("phosphoricons.com")).toBe(false);
        expect(P.string.len([8, 100])(new String("+@#)("))).toBe(false);
        expect(P.string.len([0, 8])(NaN)).toBe(false);
        expect(P.string.len(8)(undefined)).toBe(false);
        expect(P.string.len(1)({})).toBe(false);
        expect(P.string.len(1)([{}])).toBe(false);
      });
    });
  });

  describe("number", () => {
    it("matches number primitives and objects", () => {
      expect(P.number(5)).toBe(true);
      expect(P.number(-1.7777)).toBe(true);
      expect(P.number(new Number())).toBe(true);
      expect(P.number(new Number(123.45))).toBe(true);
      expect(P.number(NaN)).toBe(true);
    });

    it("does not match non-number", () => {
      expect(P.number("0")).toBe(false);
      expect(P.number(new Date())).toBe(false);
      expect(P.number(undefined)).toBe(false);
      expect(P.number(null)).toBe(false);
      expect(P.number({})).toBe(false);
      expect(P.number([{}])).toBe(false);
    });

    describe("gt", () => {
      it("matches number primitives and objects greater than target", () => {
        expect(P.number.gt(-5)(5)).toBe(true);
        expect(P.number.gt(-5)(-1.7777)).toBe(true);
        expect(P.number.gt(-5)(new Number())).toBe(true);
        expect(P.number.gt(-5)(new Number(123.45))).toBe(true);
      });

      it("does not match non-number and numbers lte target", () => {
        expect(P.number.gt(100)(5)).toBe(false);
        expect(P.number.gt(100)(-1.7777)).toBe(false);
        expect(P.number.gt(100)(new Number())).toBe(false);
        expect(P.number.gt(-5)(NaN)).toBe(false);
        expect(P.number.gt(0)("0")).toBe(false);
        expect(P.number.gt(0)(new Date())).toBe(false);
        expect(P.number.gt(0)(undefined)).toBe(false);
        expect(P.number.gt(0)(null)).toBe(false);
        expect(P.number.gt(0)({})).toBe(false);
        expect(P.number.gt(0)([{}])).toBe(false);
      });
    });

    describe("gte", () => {
      it("matches number primitives and objects gte target", () => {
        expect(P.number.gte(-5)(5)).toBe(true);
        expect(P.number.gte(-5)(-5)).toBe(true);
        expect(P.number.gte(-5)(new Number())).toBe(true);
        expect(P.number.gte(-5)(new Number(123.45))).toBe(true);
      });

      it("does not match non-number and numbers lt target", () => {
        expect(P.number.gte(100)(5)).toBe(false);
        expect(P.number.gte(100)(-1.7777)).toBe(false);
        expect(P.number.gte(100)(new Number())).toBe(false);
        expect(P.number.gte(-5)(NaN)).toBe(false);
        expect(P.number.gte(0)("0")).toBe(false);
        expect(P.number.gte(0)(new Date())).toBe(false);
        expect(P.number.gte(0)(undefined)).toBe(false);
        expect(P.number.gte(0)(null)).toBe(false);
        expect(P.number.gte(0)({})).toBe(false);
        expect(P.number.gte(0)([{}])).toBe(false);
      });
    });

    describe("lt", () => {
      it("matches number primitives and objects less than target", () => {
        expect(P.number.lt(500)(5)).toBe(true);
        expect(P.number.lt(500)(-1.7777)).toBe(true);
        expect(P.number.lt(500)(new Number())).toBe(true);
        expect(P.number.lt(500)(new Number(123.45))).toBe(true);
      });

      it("does not match non-number and numbers gte target", () => {
        expect(P.number.lt(-99)(5)).toBe(false);
        expect(P.number.lt(-99)(-1.7777)).toBe(false);
        expect(P.number.lt(-99)(new Number())).toBe(false);
        expect(P.number.lt(-99)(NaN)).toBe(false);
        expect(P.number.lt(-99)("0")).toBe(false);
        expect(P.number.lt(-99)(new Date())).toBe(false);
        expect(P.number.lt(-99)(undefined)).toBe(false);
        expect(P.number.lt(-99)(null)).toBe(false);
        expect(P.number.lt(-99)({})).toBe(false);
        expect(P.number.lt(-99)([{}])).toBe(false);
      });
    });

    describe("lte", () => {
      it("matches number primitives and objects lte target", () => {
        expect(P.number.lte(5)(5)).toBe(true);
        expect(P.number.lte(500)(-5)).toBe(true);
        expect(P.number.lte(500)(new Number())).toBe(true);
        expect(P.number.lte(500)(new Number(123.45))).toBe(true);
      });

      it("does not match non-number and numbers gt target", () => {
        expect(P.number.lte(100)(500)).toBe(false);
        expect(P.number.lte(100)(Infinity)).toBe(false);
        expect(P.number.lte(-1)(new Number())).toBe(false);
        expect(P.number.lte(100)(NaN)).toBe(false);
        expect(P.number.lte(100)("0")).toBe(false);
        expect(P.number.lte(100)(new Date())).toBe(false);
        expect(P.number.lte(100)(undefined)).toBe(false);
        expect(P.number.lte(100)(null)).toBe(false);
        expect(P.number.lte(100)({})).toBe(false);
        expect(P.number.lte(100)([{}])).toBe(false);
      });
    });

    describe("between", () => {
      it("matches number primitives and objects between targets", () => {
        expect(P.number.between(-10, 10)(5)).toBe(true);
        expect(P.number.between(-10, 10)(-5)).toBe(true);
        expect(P.number.between(-10, 10)(new Number())).toBe(true);
        expect(P.number.between(-500, 500)(new Number(123.45))).toBe(true);
      });

      it("does not match non-number and numbers outside targets", () => {
        expect(P.number.between(-100, 100)(500)).toBe(false);
        expect(P.number.between(-100, 100)(Infinity)).toBe(false);
        expect(P.number.between(-100, -1)(new Number())).toBe(false);
        expect(P.number.between(-100, 100)(NaN)).toBe(false);
        expect(P.number.between(-100, 100)("0")).toBe(false);
        expect(P.number.between(-100, 100)(new Date())).toBe(false);
        expect(P.number.between(-100, 100)(undefined)).toBe(false);
        expect(P.number.between(-100, 100)(null)).toBe(false);
        expect(P.number.between(-100, 100)({})).toBe(false);
        expect(P.number.between(-100, 100)([{}])).toBe(false);
      });
    });

    describe("positive", () => {
      it("matches positive number primitives and objects", () => {
        expect(P.number.positive(5)).toBe(true);
        expect(P.number.positive(new Number(123.45))).toBe(true);
        expect(P.number.positive(Infinity)).toBe(true);
      });

      it("does not match non-number and non-positive", () => {
        expect(P.number.positive(-1)).toBe(false);
        expect(P.number.positive(0)).toBe(false);
        expect(P.number.positive(-Infinity)).toBe(false);
        expect(P.number.positive(NaN)).toBe(false);
        expect(P.number.positive("0")).toBe(false);
        expect(P.number.positive(new Date())).toBe(false);
        expect(P.number.positive(undefined)).toBe(false);
        expect(P.number.positive(null)).toBe(false);
        expect(P.number.positive({})).toBe(false);
        expect(P.number.positive([{}])).toBe(false);
      });
    });

    describe("negative", () => {
      it("matches negative number primitives and objects", () => {
        expect(P.number.negative(-5)).toBe(true);
        expect(P.number.negative(new Number(-123.45))).toBe(true);
        expect(P.number.negative(-Infinity)).toBe(true);
      });

      it("does not match non-number and non-negative", () => {
        expect(P.number.negative(1)).toBe(false);
        expect(P.number.negative(0)).toBe(false);
        expect(P.number.negative(Infinity)).toBe(false);
        expect(P.number.negative(NaN)).toBe(false);
        expect(P.number.negative("0")).toBe(false);
        expect(P.number.negative(new Date())).toBe(false);
        expect(P.number.negative(undefined)).toBe(false);
        expect(P.number.negative(null)).toBe(false);
        expect(P.number.negative({})).toBe(false);
        expect(P.number.negative([{}])).toBe(false);
      });
    });

    describe("finite", () => {
      it("matches finite number primitives and objects", () => {
        expect(P.number.finite(-5)).toBe(true);
        expect(P.number.finite(new Number(123.45))).toBe(true);
      });

      it("does not match non-number and non-finite", () => {
        expect(P.number.finite(Infinity)).toBe(false);
        expect(P.number.finite(NaN)).toBe(false);
        expect(P.number.finite("0")).toBe(false);
        expect(P.number.finite(new Date())).toBe(false);
        expect(P.number.finite(undefined)).toBe(false);
        expect(P.number.finite(null)).toBe(false);
        expect(P.number.finite({})).toBe(false);
        expect(P.number.finite([{}])).toBe(false);
      });
    });

    describe("int", () => {
      it("matches integer number primitives and objects", () => {
        expect(P.number.int(5)).toBe(true);
        expect(P.number.int(-5)).toBe(true);
        expect(P.number.int(0)).toBe(true);
      });

      it("does not match non-number and non-integer", () => {
        expect(P.number.int(123.45)).toBe(false);
        expect(P.number.int(new Number(123.45))).toBe(false);
        expect(P.number.int(Infinity)).toBe(false);
        expect(P.number.int(NaN)).toBe(false);
        expect(P.number.int("0")).toBe(false);
        expect(P.number.int(new Date())).toBe(false);
        expect(P.number.int(undefined)).toBe(false);
        expect(P.number.int(null)).toBe(false);
        expect(P.number.int({})).toBe(false);
        expect(P.number.int([{}])).toBe(false);
      });
    });
  });

  describe("bigint", () => {
    it("matches bigints", () => {
      expect(P.bigint(5n)).toBe(true);
      expect(P.bigint(BigInt(-1))).toBe(true);
    });

    it("does not match non-bigint", () => {
      expect(P.bigint(NaN)).toBe(false);
      expect(P.bigint("0")).toBe(false);
      expect(P.bigint(new Date())).toBe(false);
      expect(P.bigint(undefined)).toBe(false);
      expect(P.bigint(null)).toBe(false);
      expect(P.bigint({})).toBe(false);
      expect(P.bigint([{}])).toBe(false);
    });

    describe("gt", () => {
      it("matches bigints greater than target", () => {
        expect(P.bigint.gt(-5)(5n)).toBe(true);
        expect(P.bigint.gt(-5n)(5n)).toBe(true);
        expect(P.bigint.gt(-5)(BigInt(0))).toBe(true);
        expect(P.bigint.gt(112233445566778898n)(112233445566778899n)).toBe(
          true
        );
      });

      it("does not match non-bigint and bigints lte target", () => {
        expect(P.bigint.gt(100)(5n)).toBe(false);
        expect(P.bigint.gt(100)(-1.7777)).toBe(false);
        expect(P.bigint.gt(100)(new Number())).toBe(false);
        expect(P.bigint.gt(-5)(NaN)).toBe(false);
        expect(P.bigint.gt(0)("0")).toBe(false);
        expect(P.bigint.gt(0)(new Date())).toBe(false);
        expect(P.bigint.gt(0)(undefined)).toBe(false);
        expect(P.bigint.gt(0)(null)).toBe(false);
        expect(P.bigint.gt(0)({})).toBe(false);
        expect(P.bigint.gt(0)([{}])).toBe(false);
      });
    });

    describe("gte", () => {
      it("matches bigints gte target", () => {
        expect(P.bigint.gte(-5)(-5n)).toBe(true);
        expect(P.bigint.gte(-5n)(5n)).toBe(true);
        expect(P.bigint.gte(-5)(BigInt(0))).toBe(true);
        expect(P.bigint.gte(112233445566778898n)(112233445566778899n)).toBe(
          true
        );
      });

      it("does not match non-bigint and bigints lt target", () => {
        expect(P.bigint.gte(100n)(5)).toBe(false);
        expect(P.bigint.gte(100)(-1.7777)).toBe(false);
        expect(P.bigint.gte(100)(new Number())).toBe(false);
        expect(P.bigint.gte(-5)(NaN)).toBe(false);
        expect(P.bigint.gte(0)("0")).toBe(false);
        expect(P.bigint.gte(0)(new Date())).toBe(false);
        expect(P.bigint.gte(0)(undefined)).toBe(false);
        expect(P.bigint.gte(0)(null)).toBe(false);
        expect(P.bigint.gte(0)({})).toBe(false);
        expect(P.bigint.gte(0)([{}])).toBe(false);
      });
    });

    describe("lt", () => {
      it("matches bigints less than target", () => {
        expect(P.bigint.lt(500)(5n)).toBe(true);
        expect(P.bigint.lt(500)(BigInt(5))).toBe(true);
        expect(P.bigint.lt(5)(BigInt(0))).toBe(true);
        expect(P.bigint.lt(112233445566778899n)(112233445566778898n)).toBe(
          true
        );
      });

      it("does not match non-bigint and bigints gte target", () => {
        expect(P.bigint.lt(-99)(5n)).toBe(false);
        expect(P.bigint.lt(-99)(-1.7777)).toBe(false);
        expect(P.bigint.lt(-99)(new Number())).toBe(false);
        expect(P.bigint.lt(-99)(NaN)).toBe(false);
        expect(P.bigint.lt(-99)("0")).toBe(false);
        expect(P.bigint.lt(-99)(new Date())).toBe(false);
        expect(P.bigint.lt(-99)(undefined)).toBe(false);
        expect(P.bigint.lt(-99)(null)).toBe(false);
        expect(P.bigint.lt(-99)({})).toBe(false);
        expect(P.bigint.lt(-99)([{}])).toBe(false);
      });
    });

    describe("lte", () => {
      it("matches bigints lte target", () => {
        expect(P.bigint.lte(5n)(5n)).toBe(true);
        expect(P.bigint.lte(500)(-5n)).toBe(true);
        expect(P.bigint.lte(500)(BigInt(0))).toBe(true);
        expect(P.bigint.lte(112233445566778899n)(112233445566778899n)).toBe(
          true
        );
      });

      it("does not match non-bigint and bigints gt target", () => {
        expect(P.bigint.lte(100)(500n)).toBe(false);
        expect(P.bigint.lte(100)(Infinity)).toBe(false);
        expect(P.bigint.lte(-1)(new Number())).toBe(false);
        expect(P.bigint.lte(100)(NaN)).toBe(false);
        expect(P.bigint.lte(100)("0")).toBe(false);
        expect(P.bigint.lte(100)(new Date())).toBe(false);
        expect(P.bigint.lte(100)(undefined)).toBe(false);
        expect(P.bigint.lte(100)(null)).toBe(false);
        expect(P.bigint.lte(100)({})).toBe(false);
        expect(P.bigint.lte(100)([{}])).toBe(false);
      });
    });

    describe("between", () => {
      it("matches bigints between targets", () => {
        expect(P.bigint.between(-10, 10n)(5n)).toBe(true);
        expect(P.bigint.between(-10, 10)(-5n)).toBe(true);
        expect(P.bigint.between(-10, 10)(BigInt(0))).toBe(true);
        expect(P.bigint.between(-500000000n, 500000000n)(1234567n)).toBe(true);
      });

      it("does not match non-bigint and numbers outside targets", () => {
        expect(P.bigint.between(-100n, 100n)(500n)).toBe(false);
        expect(P.bigint.between(-100n, 100n)(500)).toBe(false);
        expect(P.bigint.between(-100, 100)(Infinity)).toBe(false);
        expect(P.bigint.between(-100, -1)(new Number())).toBe(false);
        expect(P.bigint.between(-100, 100)(NaN)).toBe(false);
        expect(P.bigint.between(-100, 100)("0")).toBe(false);
        expect(P.bigint.between(-100, 100)(new Date())).toBe(false);
        expect(P.bigint.between(-100, 100)(undefined)).toBe(false);
        expect(P.bigint.between(-100, 100)(null)).toBe(false);
        expect(P.bigint.between(-100, 100)({})).toBe(false);
        expect(P.bigint.between(-100, 100)([{}])).toBe(false);
      });
    });

    describe("positive", () => {
      it("matches positive bigints", () => {
        expect(P.bigint.positive(5n)).toBe(true);
        expect(P.bigint.positive(BigInt(123))).toBe(true);
        expect(P.bigint.positive(9999999999999999999n)).toBe(true);
      });

      it("does not match non-bigint and non-positive", () => {
        expect(P.bigint.positive(-1n)).toBe(false);
        expect(P.bigint.positive(0n)).toBe(false);
        expect(P.bigint.positive(0)).toBe(false);
        expect(P.bigint.positive(-Infinity)).toBe(false);
        expect(P.bigint.positive(NaN)).toBe(false);
        expect(P.bigint.positive("0")).toBe(false);
        expect(P.bigint.positive(new Date())).toBe(false);
        expect(P.bigint.positive(undefined)).toBe(false);
        expect(P.bigint.positive(null)).toBe(false);
        expect(P.bigint.positive({})).toBe(false);
        expect(P.bigint.positive([{}])).toBe(false);
      });
    });

    describe("negative", () => {
      it("matches negative bigints", () => {
        expect(P.bigint.negative(-5n)).toBe(true);
        expect(P.bigint.negative(BigInt(-123))).toBe(true);
        expect(P.bigint.negative(-9999999999999999999n)).toBe(true);
      });

      it("does not match non-bigint and non-negative", () => {
        expect(P.bigint.negative(1n)).toBe(false);
        expect(P.bigint.negative(0n)).toBe(false);
        expect(P.bigint.negative(0)).toBe(false);
        expect(P.bigint.negative(-Infinity)).toBe(false);
        expect(P.bigint.negative(NaN)).toBe(false);
        expect(P.bigint.negative("0")).toBe(false);
        expect(P.bigint.negative(new Date())).toBe(false);
        expect(P.bigint.negative(undefined)).toBe(false);
        expect(P.bigint.negative(null)).toBe(false);
        expect(P.bigint.negative({})).toBe(false);
        expect(P.bigint.negative([{}])).toBe(false);
      });
    });
  });

  describe("function", () => {
    const l0 = () => {};
    const l1 = (a: any) => {};
    const l2 = (a: any, b: any) => {};

    function f0() {}
    function f1(a: any) {}
    function f2(a: any, b: any) {}

    const c = new (class {
      p0 = null;
      p1 = 99;
      m0() {}
      m1(a: any) {}
    })();

    it("matches functions", () => {
      expect(P.function(l0)).toBe(true);
      expect(P.function(l1)).toBe(true);
      expect(P.function(l2)).toBe(true);
      expect(P.function(f0)).toBe(true);
      expect(P.function(f1)).toBe(true);
      expect(P.function(f2)).toBe(true);
      expect(P.function(c.m0)).toBe(true);
      expect(P.function(c.m1)).toBe(true);
    });

    it("does not match non-functions", () => {
      expect(P.function(c.p0)).toBe(false);
      expect(P.function(c.p1)).toBe(false);
      expect(P.function(0)).toBe(false);
      expect(P.function(-Infinity)).toBe(false);
      expect(P.function(NaN)).toBe(false);
      expect(P.function("0")).toBe(false);
      expect(P.function(new Date())).toBe(false);
      expect(P.function(undefined)).toBe(false);
      expect(P.function(null)).toBe(false);
      expect(P.function({})).toBe(false);
      expect(P.function([{}])).toBe(false);
    });

    describe("arity", () => {
      it("matches function when arity equals target", () => {
        expect(P.function.arity(0)(l0)).toBe(true);
        expect(P.function.arity(1)(l1)).toBe(true);
        expect(P.function.arity(2)(l2)).toBe(true);
        expect(P.function.arity(0)(f0)).toBe(true);
        expect(P.function.arity(1)(f1)).toBe(true);
        expect(P.function.arity(2)(f2)).toBe(true);
        expect(P.function.arity(0)(c.m0)).toBe(true);
        expect(P.function.arity(1)(c.m1)).toBe(true);
      });

      it("does not match non-functions and wrong arity", () => {
        expect(P.function.arity(0)(l1)).toBe(false);
        expect(P.function.arity(1)(f2)).toBe(false);
        expect(P.function.arity(2)(c.m0)).toBe(false);
        expect(P.function.arity(0)(0)).toBe(false);
        expect(P.function.arity(0)(-Infinity)).toBe(false);
        expect(P.function.arity(0)(NaN)).toBe(false);
        expect(P.function.arity(0)("0")).toBe(false);
        expect(P.function.arity(0)(new Date())).toBe(false);
        expect(P.function.arity(0)(undefined)).toBe(false);
        expect(P.function.arity(0)(null)).toBe(false);
        expect(P.function.arity(0)({})).toBe(false);
        expect(P.function.arity(0)([{}])).toBe(false);
      });
    });
  });

  describe("object", () => {
    const obj = {};
    const arr = [69, 420];
    const pkmn = {
      name: P.string,
      level: P.number.positive,
      types: P.string.enum(["normal", "fire", "water", "electric"]),
    };
    const nObj = new Number();
    const clazz = new (class {})();

    it("matches objects", () => {
      expect(P.object(obj)).toBe(true);
      expect(P.object(arr)).toBe(true);
      expect(P.object(pkmn)).toBe(true);
      expect(P.object(nObj)).toBe(true);
      expect(P.object(clazz)).toBe(true);
      expect(P.object(new Date())).toBe(true);
    });

    it("does not match non-objects", () => {
      expect(P.object(NaN)).toBe(false);
      expect(P.object(0)).toBe(false);
      expect(P.object("0")).toBe(false);
      expect(P.object(undefined)).toBe(false);
      expect(P.object(null)).toBe(false);
    });

    describe("strict", () => {
      it("matches objects when strictly equal", () => {
        expect(P.object.strict({})(obj)).toBe(true);
        expect(P.object.strict({})(clazz)).toBe(true);
        expect(P.object.strict({ foo: 42 })({ foo: 42 })).toBe(true);
        expect(
          P.object.strict(pkmn)({
            name: "pikachu",
            level: 13,
            types: "electric",
          })
        ).toBe(true);
      });

      it("does not match non-objects and non-identical objects", () => {
        expect(P.object.strict({})({ foo: 42 })).toBe(false);
        expect(P.object.strict({ foo: 42 })({})).toBe(false);
        expect(
          P.object.strict(pkmn)({ name: "abra", level: 32, type: "demonic" })
        ).toBe(false);
        expect(P.object.strict({})(NaN)).toBe(false);
        expect(P.object.strict({})(0)).toBe(false);
        expect(P.object.strict({})("0")).toBe(false);
        expect(P.object.strict({})(undefined)).toBe(false);
        expect(P.object.strict({})(null)).toBe(false);
        expect(P.object.strict({})([""])).toBe(false);
      });
    });
  });

  describe("date", () => {
    const now = new Date();
    const bday = new Date("1989-07-29");
    const moonLanding = new Date("1969-07-20");

    it("matches dates", () => {
      expect(P.date(new Date())).toBe(true);
      expect(P.date(new Date("2023-01-01"))).toBe(true);
      expect(P.date(moonLanding)).toBe(true);
    });

    it("does not match non-dates", () => {
      expect(P.date("1969-07-20")).toBe(false);
      expect(P.date(Date.now())).toBe(false);
      expect(P.date(0)).toBe(false);
      expect(P.date(-Infinity)).toBe(false);
      expect(P.date(NaN)).toBe(false);
      expect(P.date("0")).toBe(false);
      expect(P.date(undefined)).toBe(false);
      expect(P.date(null)).toBe(false);
      expect(P.date({})).toBe(false);
      expect(P.date([{}])).toBe(false);
    });

    describe("before", () => {
      it("matches dates before target", () => {
        expect(P.date.before(now)(bday)).toBe(true);
        expect(P.date.before(now)(moonLanding)).toBe(true);
        expect(P.date.before("2023-01-01")(moonLanding)).toBe(true);
      });

      it("does not match non-dates and dates at or after target", () => {
        expect(P.date.before(moonLanding)(now)).toBe(false);
        expect(P.date.before(moonLanding)(bday)).toBe(false);
        expect(P.date.before(moonLanding)(moonLanding)).toBe(false);
        expect(P.date.before(moonLanding)(new Date())).toBe(false);
        expect(P.date.before(now)(0)).toBe(false);
        expect(P.date.before(now)(-Infinity)).toBe(false);
        expect(P.date.before(now)(NaN)).toBe(false);
        expect(P.date.before(now)("0")).toBe(false);
        expect(P.date.before(now)(undefined)).toBe(false);
        expect(P.date.before(now)(null)).toBe(false);
        expect(P.date.before(now)({})).toBe(false);
        expect(P.date.before(now)([{}])).toBe(false);
      });
    });

    describe("atOrBefore", () => {
      it("matches dates at or before target", () => {
        expect(P.date.atOrBefore(now)(bday)).toBe(true);
        expect(P.date.atOrBefore(now)(moonLanding)).toBe(true);
        expect(P.date.atOrBefore(moonLanding)(moonLanding)).toBe(true);
        expect(P.date.atOrBefore("2023-01-01")(moonLanding)).toBe(true);
      });

      it("does not match non-dates and dates after target", () => {
        expect(P.date.atOrBefore(moonLanding)(now)).toBe(false);
        expect(P.date.atOrBefore(moonLanding)(bday)).toBe(false);
        expect(P.date.atOrBefore(moonLanding)(new Date())).toBe(false);
        expect(P.date.atOrBefore(now)(0)).toBe(false);
        expect(P.date.atOrBefore(now)(-Infinity)).toBe(false);
        expect(P.date.atOrBefore(now)(NaN)).toBe(false);
        expect(P.date.atOrBefore(now)("0")).toBe(false);
        expect(P.date.atOrBefore(now)(undefined)).toBe(false);
        expect(P.date.atOrBefore(now)(null)).toBe(false);
        expect(P.date.atOrBefore(now)({})).toBe(false);
        expect(P.date.atOrBefore(now)([{}])).toBe(false);
      });
    });

    describe("after", () => {
      it("matches dates after target", () => {
        expect(P.date.after(bday)(now)).toBe(true);
        expect(P.date.after(moonLanding)(now)).toBe(true);
        expect(P.date.after("1900-01-01")(now)).toBe(true);
      });

      it("does not match non-dates and dates at or before target", () => {
        expect(P.date.after(now)(moonLanding)).toBe(false);
        expect(P.date.after(bday)(moonLanding)).toBe(false);
        expect(P.date.after(moonLanding)(moonLanding)).toBe(false);
        expect(P.date.after(new Date())(moonLanding)).toBe(false);
        expect(P.date.after(now)(0)).toBe(false);
        expect(P.date.after(now)(-Infinity)).toBe(false);
        expect(P.date.after(now)(NaN)).toBe(false);
        expect(P.date.after(now)("0")).toBe(false);
        expect(P.date.after(now)(undefined)).toBe(false);
        expect(P.date.after(now)(null)).toBe(false);
        expect(P.date.after(now)({})).toBe(false);
        expect(P.date.after(now)([{}])).toBe(false);
      });
    });

    describe("atOrAfter", () => {
      it("matches dates at or after target", () => {
        expect(P.date.atOrAfter(bday)(now)).toBe(true);
        expect(P.date.atOrAfter(moonLanding)(now)).toBe(true);
        expect(P.date.atOrAfter("1900-01-01")(moonLanding)).toBe(true);
      });

      it("does not match non-dates and dates before target", () => {
        expect(P.date.atOrAfter(now)(moonLanding)).toBe(false);
        expect(P.date.atOrAfter(bday)(moonLanding)).toBe(false);
        expect(P.date.atOrAfter(new Date())(moonLanding)).toBe(false);
        expect(P.date.atOrAfter(now)(0)).toBe(false);
        expect(P.date.atOrAfter(now)(-Infinity)).toBe(false);
        expect(P.date.atOrAfter(now)(NaN)).toBe(false);
        expect(P.date.atOrAfter(now)("0")).toBe(false);
        expect(P.date.atOrAfter(now)(undefined)).toBe(false);
        expect(P.date.atOrAfter(now)(null)).toBe(false);
        expect(P.date.atOrAfter(now)({})).toBe(false);
        expect(P.date.atOrAfter(now)([{}])).toBe(false);
      });
    });
  });

  describe("array", () => {
    it("matches arrays", () => {});
    it("does not match non-arrays", () => {});

    describe("of", () => {
      it("matches arrays of target types", () => {});
      it("does not match non-arrays and non-compliant arrays", () => {});
    });

    describe("of", () => {
      it("matches arrays that include target type", () => {});
      it("does not match non-arrays and non-inclusive arrays", () => {});
    });

    describe("len", () => {
      it("matches arrays of target length", () => {});
      it("does not match non-arrays and arrays of incorrect length", () => {});
    });
  });

  describe("tuple", () => {
    it("matches tuples", () => {});
    it("does not match non-tuples and tuples or arrays with incorrect items", () => {});
  });

  describe("union", () => {
    it("matches one of target union types", () => {});
    it("does not match non-members of union", () => {});
  });

  describe("intersection", () => {
    it("matches intersection of target types", () => {});
    it("does not match non-intersection types", () => {});
  });

  describe("instanceOf", () => {
    it("matches instances of target type", () => {});
    it("does not match non-instances of target", () => {});
  })
});
