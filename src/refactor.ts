import {
  Guard,
  Return,
  MatchBranch,
  TypeAssert,
  ParametricAssert,
  GuardObject,
} from "./types";
import { isFunction } from "./utils";

function validate<I, O>(guard: Guard<I>) {
  return function (subject: O): boolean {
    let matched = false;

    if (guard === subject) {
      return true;
    } else if (
      isFunction(guard) &&
      (guard as (input: I | O) => boolean)(subject)
    ) {
      matched = true;
    } else if (typeof guard === "object") {
      // Array; process each item recursively
      if (Array.isArray(guard)) {
        for (const g of guard) {
          if (validate(g)(subject)) {
            matched = true;
            break;
          }
        }
      } else if (
        guard !== null &&
        typeof subject === "object" &&
        subject !== null
      ) {
        // Object object; process fields
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
                return value.some((v) => validate(v)(test));
              } else {
                return validate(value)(test);
              }
            }

            return false;
          })
        );
      }
    }

    return matched;
  };
}

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

  execute<Override>(override?: In | Override): Out | undefined {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, ret] of this.#branches) {
      this.#matched = validate(guard)(value);
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

  static not = createInverseProxy(P);

  static optional = createOptionalProxy(P);

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
    return typeof input === "string";
  } as TypeAssert<string> & {
    includes: ParametricAssert<string>;
    startsWith: ParametricAssert<string>;
    endsWith: ParametricAssert<string>;
    uppercase: TypeAssert<string>;
    lowercase: TypeAssert<string>;
    alphabetic: TypeAssert<string>;
    alphanumeric: TypeAssert<string>;
    numeric: TypeAssert<string>;
    len: ParametricAssert<string, [number]>;
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

  static function = function (input: any) {
    return typeof input === "function";
  } as TypeAssert<(...args: any[]) => unknown> & {
    arity: ParametricAssert<(...args: any[]) => unknown, [number]>;
  };

  static symbol = function (input: any): input is symbol {
    return typeof input === "symbol";
  };

  static object = function <In>(input: In) {
    return input !== null && typeof input === "object";
  } as TypeAssert<string> & {
    shape: <O extends object>(
      shape: GuardObject<O>
    ) => (input: any) => input is O;
  };

  static array = function <In>(input: In) {
    return Array.isArray(input);
  } as ((input: any) => input is any[]) & {
    of: <E>(...elements: Guard<E>[]) => (input: any) => input is E[];
    includes: <E>(value: Guard<E>) => (input: any) => input is unknown[];
    len: ParametricAssert<unknown[], [number]>;
  };

  static tuple = function <E>(tuple: Guard<E>[]) {
    return function (input: any): input is E {
      return (
        P.array(input) &&
        tuple.length > 0 &&
        input.length === tuple.length &&
        input.every((el, i) => validate(tuple[i])(el))
      );
    };
  };

  static instanceOf<C extends Function>(ctor: C) {
    return function (input: any): input is C {
      return input instanceof ctor;
    };
  }

  static {
    // ==== STRING ====
    P.string.includes = (value: string) => {
      return (input: any): input is string =>
        P.string(input) && input.includes(value);
    };
    P.string.startsWith = (value: string) => {
      return (input: any): input is string =>
        P.string(input) && input.startsWith(value);
    };
    P.string.endsWith = (value: string) => {
      return (input: any): input is string =>
        P.string(input) && input.endsWith(value);
    };
    P.string.uppercase = (input: any): input is string => {
      const re = /^[A-Z]*$/;
      return re.test(input as string);
    };
    P.string.lowercase = (input: any): input is string => {
      const re = /^[a-z]*$/;
      return re.test(input as string);
    };
    P.string.numeric = (input: any): input is string => {
      const re = /^\d*$/;
      return re.test(input as string);
    };
    P.string.alphabetic = (input: any): input is string => {
      const re = /^[a-zA-Z]*$/;
      return re.test(input as string);
    };
    P.string.alphanumeric = (input: any): input is string => {
      const re = /^[a-zA-Z0-9]*$/;
      return re.test(input as string);
    };
    P.string.len = (len: number) => {
      return (input: any): input is string =>
        P.string(input) && input.length === len;
    };

    // ==== NUMBER ====
    P.number.gt = (value: number) => {
      return (input: any): input is number => P.number(input) && input > value;
    };
    P.number.gte = (value: number) => {
      return (input: any): input is number => P.number(input) && input >= value;
    };
    P.number.lt = (value: number) => {
      return (input: any): input is number => P.number(input) && input < value;
    };
    P.number.lte = (value: number) => {
      return (input: any): input is number => P.number(input) && input <= value;
    };
    P.number.between = (min: number, max: number) => {
      return (input: any): input is number =>
        P.number(input) && input >= min && input <= max;
    };
    P.number.positive = (input: any): input is number => {
      return P.number(input) && input > 0;
    };
    P.number.negative = (input: any): input is number => {
      return P.number(input) && input < 0;
    };
    P.number.finite = (input: any): input is number => {
      return Number.isFinite(input);
    };
    P.number.int = (input: any): input is number => {
      return Number.isInteger(input);
    };

    // ==== BIGINT ====
    P.bigint.gt = (value: number | bigint) => {
      return (input: any): input is bigint => P.bigint(input) && input > value;
    };
    P.bigint.gte = (value: number | bigint) => {
      return (input: any): input is bigint => P.bigint(input) && input >= value;
    };
    P.bigint.lt = (value: number | bigint) => {
      return (input: any): input is bigint => P.bigint(input) && input < value;
    };
    P.bigint.lte = (value: number | bigint) => {
      return (input: any): input is bigint => P.bigint(input) && input <= value;
    };
    P.bigint.between = (min: number | bigint, max: number | bigint) => {
      return (input: any): input is bigint =>
        P.bigint(input) && input >= min && input <= max;
    };
    P.bigint.positive = (input: any): input is bigint => {
      return P.bigint(input) && input > 0;
    };
    P.bigint.negative = (input: any): input is bigint => {
      return P.bigint(input) && input < 0;
    };

    // ==== FUNCTION ====
    P.function.arity = (length: number) => {
      return (input: any): input is (...args: any[]) => unknown =>
        P.function(input) && input.length === length;
    };

    // ==== OBJECT ====
    P.object.shape = <O>(shape: GuardObject<O>) => {
      return (input: any): input is O =>
        P.object(input) && validate(shape)(input);
    };

    // ==== ARRAY ====
    P.array.of = <E>(guard: Guard<E>) => {
      return (input: any): input is E[] =>
        P.array(input) &&
        input.length > 0 &&
        input.every((el) => validate(guard)(el));
    };
    P.array.includes = <E>(value: Guard<E>) => {
      return (input: any): input is Array<unknown> =>
        P.array(input) &&
        (input.includes(value) || input.some((el) => validate(value)(el)));
    };
    P.array.len = (len: number) => {
      return (input: any): input is unknown[] =>
        P.array(input) && input.length === len;
    };
  }
}

function createInverseProxy<O extends object | Function>(
  obj: O
): Omit<O, "not" | "optional"> {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === "optional" || prop === "not") return;
      const field = target[prop as keyof typeof obj];

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
      const inverse = function (input: any) {
        return !(field as Function)(input);
      } as ((input: any) => boolean) & {
        [prop: string]: (input: any) => boolean;
      };

      Object.entries(
        createInverseProxy(
          Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(field))
              .filter(
                ([_, descriptor]) => typeof descriptor.value === "function"
              )
              .map(([name, descriptor]) => [name, descriptor.value])
          )
        )
      ).forEach(([name, fn]) => {
        inverse[name] = fn;
      });

      return inverse;
    },
  });
}

function createOptionalProxy<O extends object | Function>(
  obj: O
): Omit<O, "not" | "optional"> {
  return new Proxy(obj, {
    get(target, prop) {
      if (prop === "optional" || prop === "not") return;
      const field = target[prop as keyof typeof obj];

      if (
        typeof field === "function" &&
        typeof (field as Function)(null) === "function"
      ) {
        return new Proxy(field, {
          apply: (target, _, patternArgs) => {
            return (...inputArgs: any[]) =>
              inputArgs[0] === undefined ||
              (target as Function)(...patternArgs)(...inputArgs);
          },
        });
      }

      const optional = function (input: any) {
        return input === undefined || (field as Function)(input);
      } as ((input: any) => boolean) & {
        [prop: string]: (input: any) => boolean;
      };

      Object.entries(
        createOptionalProxy(
          Object.fromEntries(
            Object.entries(Object.getOwnPropertyDescriptors(field))
              .filter(
                ([_, descriptor]) => typeof descriptor.value === "function"
              )
              .map(([name, descriptor]) => [name, descriptor.value])
          )
        )
      ).forEach(([name, fn]) => {
        optional[name] = fn;
      });

      return optional;
    },
  });
}
