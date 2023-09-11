import {
  MatchBranch,
  MatchBranchAsync,
  WhenBranch,
  WhenBranchAsync,
} from "./types";
import { isFunction } from "./utils";

export function match<In, Out = In>(
  input: In,
  matchers: Array<MatchBranch<In, Out>>,
  defaultValue?: Out
): Out | undefined {
  for (const [guard, ret] of matchers) {
    if (guard === input) {
      if (isFunction<In, Out>(ret)) {
        return ret(input);
      } else {
        return ret;
      }
    }

    if (
      typeof guard === "function" &&
      (guard as (input: In) => boolean)(input)
    ) {
      if (isFunction<In, Out>(ret)) {
        return ret(input);
      } else {
        return ret;
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          if (isFunction<In, Out>(ret)) {
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
  defaultValue?: Out | Promise<Out>
): Promise<Out | undefined> {
  for (const [guard, ret] of matchers) {
    if (guard === input) {
      if (isFunction<In, Out>(ret)) {
        return ret(input);
      } else {
        return ret as Out | Promise<Out>;
      }
    }

    if (
      typeof guard === "function" &&
      (await (guard as (input: In) => Promise<boolean>)(input))
    ) {
      if (isFunction<In, Out>(ret)) {
        return ret(input);
      } else {
        return ret as Out | Promise<Out>;
      }
    }

    if (guard instanceof Promise && (await guard)) {
      if (isFunction<In, Out>(ret)) {
        return ret(input);
      } else {
        return ret as Out | Promise<Out>;
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          if (isFunction<In, Out>(ret)) {
            return ret(input);
          } else {
            return ret as Out | Promise<Out>;
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

    if (
      typeof guard === "function" &&
      (guard as (input: In) => boolean)(input)
    ) {
      op?.(input);
      if (lazy) return;
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

    if (
      typeof guard === "function" &&
      (await (guard as (input: In) => boolean | Promise<boolean>)(input))
    ) {
      await (op instanceof Promise ? op : op?.(input));
      if (lazy) return;
    }

    if (guard instanceof Promise && (await guard)) {
      await (op instanceof Promise ? op : op?.(input));
      if (lazy) return;
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
