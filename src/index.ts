export type Guard<In> = In | In[] | ((input: In) => boolean);
export type GuardAsync<In> = Guard<In> | ((input: In) => Promise<boolean>);
export type Return<In, Out> = Out | ((input: In) => Out);
export type ReturnAsync<In, Out> =
  | Return<In, Out>
  | ((input: In) => Promise<Out>);

export type MatchBranch<In, Out> = [Guard<In>, Return<In, Out>];
export type MatchBranchAsync<In, Out> = [GuardAsync<In>, ReturnAsync<In, Out>];
export type WhenBranch<In> = [
  Guard<In>,
  ((input: In) => void) | null | undefined
];
export type WhenBranchAsync<In> = [
  GuardAsync<In>,
  ((input: In) => void | Promise<void>) | null | undefined
];

export function match<In, Out = In>(
  input: In,
  matchers: Array<MatchBranch<In, Out>>,
  defaultValue?: Out
): Out | undefined {
  for (const [guard, ret] of matchers) {
    if (guard === input) {
      if (isReturnFunction(ret)) {
        return ret(input);
      } else {
        return ret;
      }
    }

    if (typeof guard === "function") {
      if ((guard as (input: In) => boolean)(input)) {
        if (isReturnFunction(ret)) {
          return ret(input);
        } else {
          return ret;
        }
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          if (isReturnFunction(ret)) {
            return ret(input);
          } else {
            return ret;
          }
        }
      }
    }
  }

  return defaultValue;
}

export async function matchAsync<In, Out = In>(
  input: In,
  matchers: Array<MatchBranchAsync<In, Out>>,
  defaultValue?: Out
): Promise<Out | undefined> {
  for (const [guard, ret] of matchers) {
    if (guard === input) {
      if (isReturnFunction(ret)) {
        return ret(input);
      } else {
        return ret;
      }
    }

    if (typeof guard === "function") {
      if (await (guard as (input: In) => Promise<boolean>)(input)) {
        if (isReturnFunction(ret)) {
          return ret(input);
        } else {
          return ret;
        }
      }
    }

    if (guard instanceof Promise) {
      if (await guard) {
        if (isReturnFunction(ret)) {
          return ret(input);
        } else {
          return ret;
        }
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          if (isReturnFunction(ret)) {
            return ret(input);
          } else {
            return ret;
          }
        }
      }
    }
  }

  return defaultValue;
}

export function when<In>(
  input: In,
  matchers: Array<WhenBranch<In>>,
  lazy: boolean = false
): void {
  for (const [guard, op] of matchers) {
    if (guard === input) {
      op?.(input);
      if (lazy) return;
    }

    if (typeof guard === "function") {
      if ((guard as (input: In) => boolean)(input)) {
        op?.(input);
        if (lazy) return;
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          op?.(input);
          if (lazy) return;
          break; // prevent calling op multiple times
        }
      }
    }
  }
}

export async function whenAsync<In>(
  input: In,
  matchers: Array<WhenBranchAsync<In>>,
  lazy: boolean = false
): Promise<void> {
  for (const [guard, op] of matchers) {
    if (guard === input) {
      await (op instanceof Promise ? op : op?.(input));
      if (lazy) return;
    }

    if (typeof guard === "function") {
      if (await (guard as (input: In) => boolean | Promise<boolean>)(input)) {
        await (op instanceof Promise ? op : op?.(input));
        if (lazy) return;
      }
    }

    if (guard instanceof Promise) {
      if (await guard) {
        await (op instanceof Promise ? op : op?.(input));
        if (lazy) return;
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          await (op instanceof Promise ? op : op?.(input));
          if (lazy) return;
          break; // prevent calling op multiple times
        }
      }
    }
  }
}

function isReturnFunction<In, Out>(
  ret: Return<In, Out>
): ret is Extract<Return<In, Out>, Function> {
  return typeof ret === "function";
}
