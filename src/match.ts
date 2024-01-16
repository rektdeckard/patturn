import type {
  Guard,
  Return,
  MatchBranch,
  MatchBranchAsync,
  GuardAsync,
  ReturnAsync,
} from "./types";
import { isFunction } from "./utils";
import { validate, validateAsync } from "./validate";

export function match<In>(input: In) {
  return new MatchExpression<In>(input);
}

export function matchAsync<In>(input: In) {
  return new MatchExpressionAsync<In>(input);
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
      this.#matched ||= validate(guard)(value);
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

export class MatchExpressionAsync<In, Out = undefined> {
  #value: In;
  #branches: Array<MatchBranchAsync<In, Out>> = [];
  #matched: boolean = false;

  constructor(value: In) {
    this.#value = value;
  }

  static prepare<In = any>() {
    return new MatchExpressionAsync<In>(undefined as In);
  }

  with<O = Out>(guard: GuardAsync<In>, ret: ReturnAsync<In, O>) {
    this.#branches.push([guard, ret as ReturnAsync<In, Out>]);
    return this as MatchExpressionAsync<In, Exclude<Out, undefined> | O>;
  }

  async execute<Override>(override?: In | Override): Promise<Out | undefined> {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, ret] of this.#branches) {
      this.#matched = await validateAsync(guard)(value);
      if (this.#matched) {
        return isFunction<In | Override, Out>(ret) ? ret(value) : (ret as Out);
      }
    }

    return;
  }

  async concurrent<Override>(
    override?: In | Override
  ): Promise<Out | undefined> {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    const results = await Promise.all(
      this.#branches.map(async ([guard, ret]) => {
        if (await validateAsync(guard)(value)) {
          return {
            match: true,
            value: isFunction<In | Override, Out>(ret)
              ? ret(value)
              : (ret as Out),
          };
        } else {
          return { match: false };
        }
      })
    );

    return results.find((res) => res.match)?.value;
  }

  async otherwise<F>(fallback: F | ((input: In) => F)) {
    const out = await this.execute();
    if (this.#matched) return out as Out;
    return typeof fallback === "function"
      ? (fallback as (i: In) => F)(this.#value)
      : fallback;
  }
}
