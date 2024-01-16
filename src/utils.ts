export function isFunction<I, O>(value: any): value is (i: I) => O {
  return typeof value === "function";
}

export function createNegationProxy<O extends object | Function>(
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
        createNegationProxy(
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

export function createOptionalProxy<O extends object | Function>(
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
