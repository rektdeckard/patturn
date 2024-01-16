import { describe, expect, it, vi } from "vitest";
import { P, assertValid, validate, validateAsync } from "../src";
import { postsJSON } from "./fixtures";

describe("validate", () => {
  it("accepts simple values", () => {
    expect(validate(3)(3)).toBe(true);
    expect(validate([1, 2, 3])(3)).toBe(true);
    expect(validate(P.number)(3)).toBe(true);
  });

  it("accepts complex patterns", () => {
    const schema = P.array.of({
      id: P.number.positive,
      slug: P.string,
      url: P.string.url,
      title: P.string,
      content: P.string,
      image: P.string.url,
      thumbnail: P.string.url,
      status: P.string.enum(["draft", "published"]),
      category: P.string.enum([
        "lorem",
        "ipsum",
        "rutrum",
        "elementum",
        "jsonplaceholder",
      ]),
      publishedAt: P.string,
      updatedAt: P.string,
      userId: P.number.positive,
    });

    expect(validate(schema)(postsJSON)).toBe(true);
    expect(validate(P.optional.object.strict({ foo: 7 }))(null)).toBe(false);
    expect(validate([P.nullish, P.object.strict({ foo: 7 })])(null)).toBe(true);
  });

  it("throws on failed assertion", () => {
    const schema = P.object.strict({ foo: P.number });
    const assertFoo = validate(schema);
    expect(assertFoo({ foo: false })).toBe(false);
  });
});

describe("validateAsync", () => {
  it("validates simple async patterns", async ({ expect }) => {});
});

describe("assert", () => {
  it("accepts simple values", () => {
    expect(() => validate(3)(3)).not.toThrow();
    expect(() => validate([1, 2, 3])(3)).not.toThrow();
    expect(() => validate(P.number)(3)).not.toThrow();
  });

  it("accepts complex patterns", () => {
    const schema = P.array.of({
      id: P.number.positive,
      slug: P.string,
      url: P.string.url,
      title: P.string,
      content: P.string,
      image: P.string.url,
      thumbnail: P.string.url,
      status: P.string.enum(["draft", "published"]),
      category: P.string.enum([
        "lorem",
        "ipsum",
        "rutrum",
        "elementum",
        "jsonplaceholder",
      ]),
      publishedAt: P.string,
      updatedAt: P.string,
      userId: P.number.positive,
    });

    expect(() => assertValid(schema)(postsJSON)).not.toThrow();
    expect(() =>
      assertValid(P.optional.object.strict({ foo: 7 })(null))
    ).not.toThrow();
    expect(() =>
      assertValid([P.nullish, P.object.strict({ foo: 7 })])(null)
    ).not.toThrow();
  });

  it("throws on failed assertion", () => {
    const schema = P.object.strict({ foo: P.number });
    const assertFoo = assertValid(schema);
    expect(() => assertFoo({ foo: false })).toThrow();
  });
});
