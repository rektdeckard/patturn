import {
  Guard,
  Return,
  MatchBranch,
  GuardObject,
  TypeAssert,
  ParametricAssert,
} from "./types";
import { isFunction } from "./utils";

export class MatchExpression<In, Out = undefined> {
  #value: In;
  #branches: Array<MatchBranch<In, Out>> = [];
  #matched: boolean = false;

  constructor(value: In) {
    this.#value = value;
  }

  static prepare<In = any>() {
    return new MatchExpression<In>(undefined as In);
  }

  with<O = Out>(guard: Guard<In>, ret: Return<In, O>) {
    this.#branches.push([guard, ret as Return<In, Out>]);
    return this as MatchExpression<In, Exclude<Out, undefined> | O>;
  }

  #checkObject<S extends object>(guard: GuardObject<S>, subject: S): boolean {
    if (guard === subject) return true;
    let entries = Object.entries(guard);
    return (
      entries.length > 0 &&
      entries.every(([key, value]) => {
        const test = subject[key as keyof typeof subject];
        if (value === test) return true;
        if (typeof value === "function") {
          return value(test);
        }
        if (typeof value === "object" && value !== null) {
          if (Array.isArray(value)) {
            return value.some((v) => this.#check(v, test));
          } else {
            return this.#checkObject(value, test);
          }
        }

        return false;
      })
    );
  }

  #check<I, O>(guard: Guard<I>, value: O): boolean {
    let matched = false;

    if (guard === value) {
      matched = true;
    } else if (
      isFunction(guard) &&
      (guard as (input: I | O) => boolean)(value)
    ) {
      matched = true;
    } else if (typeof guard === "object") {
      // Array; process each item recursively
      if (Array.isArray(guard)) {
        for (const g of guard) {
          if (this.#check(g, value)) {
            matched = true;
            break;
          }
        }
      } else if (
        guard !== null &&
        typeof value === "object" &&
        value !== null
      ) {
        // Object object; process fields
        matched = this.#checkObject(guard as any, value);
      }
    }

    return matched;
  }

  execute<Override>(override?: In | Override): Out | undefined {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, ret] of this.#branches) {
      this.#matched = this.#check(guard, value);
      if (this.#matched) {
        return isFunction<In | Override, Out>(ret) ? ret(value) : (ret as Out);
      }
    }

    return;
  }

  otherwise<F>(fallback: F | ((input: In) => F)) {
    const out = this.execute();
    if (this.#matched) return out as Out;
    return typeof fallback === "function"
      ? (fallback as (i: In) => F)(this.#value)
      : fallback;
  }
}

export function match<In>(input: In) {
  return new MatchExpression<In>(input);
}

export class P {
  constructor(..._: never[]) {
    throw new Error("Patters are not constuctors");
  }

  static _() {
    return true as const;
  }

  static any() {
    return true as const;
  }

  static nullish(input: any): input is null | undefined {
    return input === undefined || input === null;
  }

  static self<In>(value: In): In {
    return value;
  }

  static not: typeof P = new Proxy(P, {
    get(target, prop) {
      const field = target[prop as keyof typeof P];
      if (
        typeof field === "function" &&
        typeof (field as Function)(null) === "function"
      ) {
        return new Proxy(field, {
          apply: (target, _, patternArgs) => {
            return (...inputArgs: any[]) =>
              !(target as Function)(...patternArgs)(...inputArgs);
          },
        });
      }
      return (input: any) => !(field as Function)(input);
    },
  });

  static boolean(input: any): input is boolean {
    return typeof input === "boolean";
  }

  static truthy<In>(
    input: In
  ): input is Exclude<In, null | undefined | false | 0> {
    return !!input;
  }

  static falsy(input: any): input is null | undefined | false | 0 {
    return !input;
  }

  static string = function (input: any): input is string {
    P.string.includes = function (value: string) {
      return function (input: any): input is string {
        return typeof input === "string" && input.includes(value);
      };
    };
    P.string.startsWith = function (value: string) {
      return function (input: any): input is string {
        return typeof input === "string" && input.startsWith(value);
      };
    };
    P.string.endsWith = function (value: string) {
      return function (input: any): input is string {
        return typeof input === "string" && input.endsWith(value);
      };
    };
    P.string.uppercase = function (input): input is string {
      const re = /^[A-Z]*$/;
      return re.test(input as string);
    };
    P.string.lowercase = function (input: any): input is string {
      const re = /^[a-z]*$/;
      return re.test(input as string);
    };
    P.string.numeric = function (input: any): input is string {
      const re = /^\d*$/;
      return re.test(input as string);
    };
    P.string.alphanumeric = function (input: any): input is string {
      const re = /^[a-zA-Z0-9]*$/;
      return re.test(input as string);
    };

    return typeof input === "string";
  } as TypeAssert<string> & {
    includes: ParametricAssert<string>;
    startsWith: ParametricAssert<string>;
    endsWith: ParametricAssert<string>;
    uppercase: TypeAssert<string>;
    lowercase: TypeAssert<string>;
    alphanumeric: TypeAssert<string>;
    numeric: TypeAssert<string>;
  };

  static regex(expr: RegExp) {
    return function (input: any) {
      return expr.test(input as string);
    };
  }

  static contains<V>(value: V) {
    return function (input: any): input is Array<V> | Set<V> | string {
      if (Array.isArray(input)) {
        return input.includes(value);
      }

      if (input instanceof Set) {
        return input.has(value);
      }

      if (typeof input === "string") {
        return input.includes(value as string);
      }

      return false;
    };
  }

  static number = function (input: any) {
    P.number.gt = function (value: number) {
      return function (input: any): input is number {
        return P.number(input) && input > value;
      };
    };
    P.number.gte = function (value: number) {
      return function (input: any): input is number {
        return P.number(input) && input >= value;
      };
    };
    P.number.lt = function (value: number) {
      return function (input: any): input is number {
        return P.number(input) && input < value;
      };
    };
    P.number.lte = function (value: number) {
      return function (input: any): input is number {
        return P.number(input) && input <= value;
      };
    };
    P.number.between = function (min: number, max: number) {
      return function (input: any): input is number {
        return P.number(input) && input >= min && input <= max;
      };
    };
    P.number.positive = function (input: any): input is number {
      return P.number(input) && input > 0;
    };
    P.number.negative = function (input: any): input is number {
      return P.number(input) && input < 0;
    };
    P.number.finite = function (input: any): input is number {
      return Number.isFinite(input);
    };
    P.number.int = function (input: any): input is number {
      return Number.isInteger(input);
    };

    return typeof input === "number";
  } as TypeAssert<number> & {
    gt: ParametricAssert<number>;
    gte: ParametricAssert<number>;
    lt: ParametricAssert<number>;
    lte: ParametricAssert<number>;
    between: ParametricAssert<number, [number, number]>;
    positive: TypeAssert<number>;
    negative: TypeAssert<number>;
    finite: TypeAssert<number>;
    int: TypeAssert<number>;
  };

  static bigint = function (input: any) {
    P.bigint.gt = function (value: number | bigint) {
      return function (input: any): input is bigint {
        return P.bigint(input) && input > value;
      };
    };
    P.bigint.gte = function (value: number | bigint) {
      return function (input: any): input is bigint {
        return P.bigint(input) && input >= value;
      };
    };
    P.bigint.lt = function (value: number | bigint) {
      return function (input: any): input is bigint {
        return P.bigint(input) && input < value;
      };
    };
    P.bigint.lte = function (value: number | bigint) {
      return function (input: any): input is bigint {
        return P.bigint(input) && input <= value;
      };
    };
    P.bigint.between = function (min: number | bigint, max: number | bigint) {
      return function (input: any): input is bigint {
        return P.bigint(input) && input >= min && input <= max;
      };
    };
    P.bigint.positive = function (input: any): input is bigint {
      return P.bigint(input) && input > 0;
    };
    P.bigint.negative = function (input: any): input is bigint {
      return P.bigint(input) && input < 0;
    };

    return typeof input === "bigint";
  } as TypeAssert<bigint> & {
    gt: ParametricAssert<bigint, [number | bigint]>;
    gte: ParametricAssert<bigint, [number | bigint]>;
    lt: ParametricAssert<bigint, [number | bigint]>;
    lte: ParametricAssert<bigint, [number | bigint]>;
    between: ParametricAssert<bigint, [number | bigint, number | bigint]>;
    positive: TypeAssert<bigint>;
    negative: TypeAssert<bigint>;
  };

  static func = function (input: any) {
    P.func.arity = function (length: number) {
      return function (input: any): input is (...args: any[]) => unknown {
        return P.func(input) && input.length === length;
      };
    };

    return typeof input === "function";
  } as TypeAssert<(...args: any[]) => unknown> & {
    arity: ParametricAssert<(...args: any[]) => unknown, [number]>;
  };

  static symbol = function (input: any): input is symbol {
    return typeof input === "symbol";
  };

  static object<In>(input: In) {
    return input !== null && typeof input === "object";
  }

  static array<In>(input: In) {
    return Array.isArray(input);
  }

  static instanceOf<C extends Function>(ctor: C) {
    return function (input: any): input is C {
      return input instanceof ctor;
    };
  }
}
