export type Guard<In> = In | In[] | ((input: In) => boolean);
export type Return<In, Out> = Out | ((input: In) => Out);

export type MatchBranch<In, Out> = [Guard<In>, Return<In, Out>];
export type WhenBranch<In> = [Guard<In>, (input: In) => void];

export function match<In, Out = In>(
  input: In,
  matchers: Array<MatchBranch<In, Out>>,
  defaultValue?: Out
): Out | undefined {
  for (const [guard, ret] of matchers) {
    if (guard === input) {
      if (typeof ret === "function") {
        return (ret as (input: In) => Out)(input);
      } else {
        return ret;
      }
    }

    if (typeof guard === "function") {
      if ((guard as (input: In) => boolean)(input)) {
        if (typeof ret === "function") {
          return (ret as (input: In) => Out)(input);
        } else {
          return ret;
        }
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          if (typeof ret === "function") {
            return (ret as (input: In) => Out)(input);
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
      op(input);
      if (lazy) return;
    }

    if (typeof guard === "function") {
      if ((guard as (input: In) => boolean)(input)) {
        op(input);
        if (lazy) return;
      }
    }

    if (Array.isArray(guard)) {
      for (const g of guard) {
        if (g === input) {
          op(input);
          if (lazy) return;
        }
      }
    }
  }
}
