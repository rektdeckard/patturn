import type {
  TypeAssert,
  ParametricAssert,
  Guard,
  GuardObject,
  UnionToIntersection,
} from "./types";
import { validate } from "./validate";
import { createNegationProxy, createOptionalProxy } from "./utils";

export class P {
  constructor(..._: never[]) {
    throw new Error("Patters are not constuctors");
  }

  static _(..._: any[]) {
    return true as const;
  }

  static any(..._: any[]) {
    return true as const;
  }

  static nullish(input: any): input is null | undefined {
    return input === undefined || input === null;
  }

  static identity<In>(value: In): In {
    return value;
  }

  static not = createNegationProxy(P);

  static optional = createOptionalProxy(P);

  static boolean(input: any): input is boolean {
    return typeof input === "boolean" || input instanceof Boolean;
  }

  static truthy<In>(
    input: In
  ): input is Exclude<In, null | undefined | false | 0 | -0 | ""> {
    return !!input;
  }

  static falsy(input: any): input is null | undefined | false | 0 | -0 | "" {
    return !input;
  }

  static string = function (input: any): input is string {
    return typeof input === "string" || input instanceof String;
  } as TypeAssert<string> & {
    includes: ParametricAssert<string>;
    startsWith: ParametricAssert<string>;
    endsWith: ParametricAssert<string>;
    uppercase: TypeAssert<string>;
    lowercase: TypeAssert<string>;
    alphabetic: TypeAssert<string>;
    alphanumeric: TypeAssert<string>;
    numeric: TypeAssert<string>;
    url: TypeAssert<string> & { loose: TypeAssert<string> };
    enum: ParametricAssert<string, [values: string[]]>;
    regex: ParametricAssert<string, [re: RegExp]>;
    len: ParametricAssert<
      string,
      [number | [min: number | null, max?: number | null]]
    >;
  };

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
    return typeof input === "number" || input instanceof Number;
  } as TypeAssert<number> & {
    gt: ParametricAssert<number>;
    gte: ParametricAssert<number>;
    lt: ParametricAssert<number>;
    lte: ParametricAssert<number>;
    between: ParametricAssert<number, [min: number, max: number]>;
    positive: TypeAssert<number>;
    negative: TypeAssert<number>;
    finite: TypeAssert<number>;
    int: TypeAssert<number>;
  };

  static bigint = function (input: any) {
    return typeof input === "bigint";
  } as TypeAssert<bigint> & {
    gt: ParametricAssert<bigint, [val: number | bigint]>;
    gte: ParametricAssert<bigint, [val: number | bigint]>;
    lt: ParametricAssert<bigint, [val: number | bigint]>;
    lte: ParametricAssert<bigint, [val: number | bigint]>;
    between: ParametricAssert<
      bigint,
      [min: number | bigint, max: number | bigint]
    >;
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
  } as TypeAssert<object> & {
    strict: <O extends object>(
      shape: GuardObject<O>
    ) => (input: any) => input is O;
  };

  static date = function <In>(input: In) {
    return input instanceof Date;
  } as TypeAssert<Date> & {
    before: (date: string | number | Date) => (input: any) => input is Date;
    atOrBefore: (date: string | number | Date) => (input: any) => input is Date;
    after: (date: string | number | Date) => (input: any) => input is Date;
    atOrAfter: (date: string | number | Date) => (input: any) => input is Date;
  };

  static array = function <In>(input: In) {
    return Array.isArray(input);
  } as ((input: any) => input is any[]) & {
    of: <E>(...elements: Guard<E>[]) => (input: any) => input is E[];
    includes: <E>(value: Guard<E>) => (input: any) => input is unknown[];
    len: ParametricAssert<
      unknown[],
      [len: number | [min: number | null, max?: number | null]]
    >;
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

  static union<T extends Array<Guard<unknown>>>(...guards: [...T]) {
    return function (
      input: any
    ): input is T[number] extends Guard<infer U> ? U : never {
      return guards.some((guard) => validate(guard)(input));
    };
  }

  static intersection<T extends Array<Guard<unknown>>>(...guards: [...T]) {
    return function (
      input: any
    ): input is T[number] extends Guard<infer U>
      ? UnionToIntersection<U>
      : never {
      return guards.every((guard) => validate(guard)(input));
    };
  }

  static instanceOf<C extends Function>(ctor: C) {
    return function (input: any): input is C {
      return input instanceof ctor;
    };
  }

  static constants = {
    RE_UPPERCASE: /^[A-Z]*$/,
    RE_LOWERCASE: /^[a-z]*$/,
    RE_NUMERIC: /^\d*$/,
    RE_ALPHABETIC: /^[a-zA-Z]*$/,
    RE_ALPHANUMERIC: /^[a-zA-Z0-9]*$/,
  };

  static {
    // ==== STRING ====
    P.string.includes = (value: string) => {
      return (input): input is string =>
        P.string(input) && input.includes(value);
    };
    P.string.startsWith = (value: string) => {
      return (input): input is string =>
        P.string(input) && input.startsWith(value);
    };
    P.string.endsWith = (value: string) => {
      return (input): input is string =>
        P.string(input) && input.endsWith(value);
    };
    P.string.uppercase = (input): input is string => {
      return P.string(input) && P.constants.RE_UPPERCASE.test(input);
    };
    P.string.lowercase = (input): input is string => {
      return P.string(input) && P.constants.RE_LOWERCASE.test(input);
    };
    P.string.numeric = (input): input is string => {
      return P.string(input) && P.constants.RE_NUMERIC.test(input);
    };
    P.string.alphabetic = (input): input is string => {
      return P.string(input) && P.constants.RE_ALPHABETIC.test(input);
    };
    P.string.alphanumeric = (input): input is string => {
      return P.string(input) && P.constants.RE_ALPHANUMERIC.test(input);
    };
    P.string.url = ((input): input is string => {
      if (!P.string(input)) return false;
      try {
        return URL.canParse(input);
      } catch (_) {
        try {
          return !!new URL(input);
        } catch (_) {
          return false;
        }
      }
    }) as (typeof P)["string"]["url"];
    P.string.url.loose = (input): input is string => {
      return (
        P.string.url(input) ||
        (P.string(input) && P.string.url(`http://${input}`))
      );
    };
    P.string.enum = (values) => {
      return (input): input is string => {
        if (!P.string(input)) return false;
        const test = typeof input === "string" ? input : `${input}`;
        return values.some((v) => test === v);
      };
    };
    P.string.regex = (expr: RegExp) => {
      return (input): input is string => P.string(input) && expr.test(input);
    };
    P.string.len = (
      len: number | [min: number | null, max?: number | null]
    ) => {
      return (input): input is string => {
        if (!P.string(input)) return false;
        if (Array.isArray(len)) {
          const [min, max] = len;
          return (
            input.length >= (min ?? 0) && input.length <= (max ?? Infinity)
          );
        } else {
          return input.length === len;
        }
      };
    };

    // ==== NUMBER ====
    P.number.gt = (value: number) => {
      return (input): input is number => P.number(input) && input > value;
    };
    P.number.gte = (value: number) => {
      return (input): input is number => P.number(input) && input >= value;
    };
    P.number.lt = (value: number) => {
      return (input): input is number => P.number(input) && input < value;
    };
    P.number.lte = (value: number) => {
      return (input): input is number => P.number(input) && input <= value;
    };
    P.number.between = (min: number, max: number) => {
      return (input): input is number =>
        P.number(input) && input >= min && input <= max;
    };
    P.number.positive = (input): input is number => {
      return P.number(input) && input > 0;
    };
    P.number.negative = (input): input is number => {
      return P.number(input) && input < 0;
    };
    P.number.finite = (input): input is number => {
      return P.number(input) && Number.isFinite(+input);
    };
    P.number.int = (input): input is number => {
      return P.number(input) && Number.isInteger(+input);
    };

    // ==== BIGINT ====
    P.bigint.gt = (value: number | bigint) => {
      return (input): input is bigint => P.bigint(input) && input > value;
    };
    P.bigint.gte = (value: number | bigint) => {
      return (input): input is bigint => P.bigint(input) && input >= value;
    };
    P.bigint.lt = (value: number | bigint) => {
      return (input): input is bigint => P.bigint(input) && input < value;
    };
    P.bigint.lte = (value: number | bigint) => {
      return (input): input is bigint => P.bigint(input) && input <= value;
    };
    P.bigint.between = (min: number | bigint, max: number | bigint) => {
      return (input): input is bigint =>
        P.bigint(input) && input >= min && input <= max;
    };
    P.bigint.positive = (input): input is bigint => {
      return P.bigint(input) && input > 0;
    };
    P.bigint.negative = (input): input is bigint => {
      return P.bigint(input) && input < 0;
    };

    // ==== FUNCTION ====
    P.function.arity = (length: number) => {
      return (input): input is (...args: any[]) => unknown =>
        P.function(input) && input.length === length;
    };

    // ==== OBJECT ====
    P.object.strict = <O>(shape: GuardObject<O> & {}) => {
      return (input): input is O => {
        if (!P.object(input)) return false;
        if (!validate(shape)(input)) return false;

        const keys = new Set(Object.keys(input));
        const shapeKeys = new Set(Object.keys(shape));
        return (
          [...keys.values()].every((key) => shapeKeys.has(key)) &&
          [...shapeKeys.values()].every((key) => keys.has(key))
        );
      };
    };

    // ==== DATE ====
    P.date.before = (date) => {
      return (input): input is Date => {
        if (!P.date(input)) return false;
        const d = date instanceof Date ? date : new Date(date);
        return input.getTime() < d.getTime();
      };
    };
    P.date.atOrBefore = (date) => {
      return (input): input is Date => {
        if (!P.date(input)) return false;
        const d = date instanceof Date ? date : new Date(date);
        return input.getTime() <= d.getTime();
      };
    };
    P.date.after = (date) => {
      return (input): input is Date => {
        if (!P.date(input)) return false;
        const d = date instanceof Date ? date : new Date(date);
        return input.getTime() > d.getTime();
      };
    };
    P.date.atOrAfter = (date) => {
      return (input): input is Date => {
        if (!P.date(input)) return false;
        const d = date instanceof Date ? date : new Date(date);
        return input.getTime() >= d.getTime();
      };
    };

    // ==== ARRAY ====
    P.array.of = <E>(guard: Guard<E>) => {
      return (input): input is E[] =>
        P.array(input) &&
        input.length > 0 &&
        input.every((el) => validate(guard)(el));
    };
    P.array.includes = <E>(value: Guard<E>) => {
      return (input): input is Array<unknown> =>
        P.array(input) &&
        (input.includes(value) || input.some((el) => validate(value)(el)));
    };
    P.array.len = (len: number | [min: number | null, max?: number | null]) => {
      return (input): input is unknown[] => {
        if (!P.array(input)) return false;
        if (Array.isArray(len)) {
          const [min, max] = len;
          return (
            input.length >= (min ?? 0) && input.length <= (max ?? Infinity)
          );
        } else {
          return input.length === len;
        }
      };
    };
  }
}
