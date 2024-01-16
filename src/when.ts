import type { WhenBranch, Guard, WhenBranchAsync, GuardAsync } from "./types";
import { validate, validateAsync } from "./validate";

export function when<In>(input: In) {
  return new WhenStatement<In>(input);
}

export function whenAsync<In>(input: In) {
  return new WhenStatementAsync<In>(input);
}

export class WhenStatement<In> {
  #value: In;
  #branches: Array<WhenBranch<In>> = [];
  #matched: boolean = false;

  constructor(value: In) {
    this.#value = value;
  }

  static prepare<In = any>() {
    return new WhenStatement<In>(undefined as In);
  }

  is(guard: Guard<In>, act?: (input: In) => void) {
    this.#branches.push([guard, act]);
    return this;
  }

  exhaustive<Override>(override?: In | Override): void {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, act] of this.#branches) {
      const matched = validate(guard)(value);
      this.#matched ||= matched;

      if (matched) {
        (act as (input: In | Override) => void)?.(value);
      }
    }
  }

  lazy<Override>(override?: In | Override): void {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, act] of this.#branches) {
      const matched = validate(guard)(value);
      this.#matched ||= matched;

      if (matched) {
        (act as (input: In | Override) => void)?.(value);
        break;
      }
    }
  }

  otherwise(act: (input: In) => void) {
    this.exhaustive();
    if (this.#matched) return;
    act(this.#value);
  }
}

export class WhenStatementAsync<In> {
  #value: In;
  #branches: Array<WhenBranchAsync<In>> = [];
  #matched: boolean = false;

  constructor(value: In) {
    this.#value = value;
  }

  static prepare<In = any>() {
    return new WhenStatementAsync<In>(undefined as In);
  }

  is(guard: GuardAsync<In>, act?: (input: In) => Promise<void> | void) {
    this.#branches.push([guard, act]);
    return this;
  }

  async exhaustive<Override>(override?: In | Override): Promise<void> {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, act] of this.#branches) {
      const matched = await validateAsync(guard)(value);
      this.#matched ||= matched;

      if (matched) {
        (act as (input: In | Override) => Promise<void> | void)?.(value);
      }
    }
  }

  async lazy<Override>(override?: In | Override): Promise<void> {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    for (const [guard, act] of this.#branches) {
      const matched = await validateAsync(guard)(value);
      this.#matched ||= matched;

      if (matched) {
        (act as (input: In | Override) => Promise<void> | void)?.(value);
        break;
      }
    }
  }

  async concurrent<Override>(override?: In | Override): Promise<void> {
    this.#matched = false;
    const value = override !== undefined ? override : this.#value;

    return void Promise.all(
      this.#branches.map(async ([guard, act]) => {
        const matched = await validateAsync(guard)(value);
        this.#matched ||= matched;
        if (matched) {
          (act as (input: In | Override) => Promise<void> | void)?.(value);
        }
      })
    );
  }

  async otherwise(act: (input: In) => Promise<void> | void) {
    await this.exhaustive();
    if (this.#matched) return;
    return act(this.#value);
  }

  // TODO: concurrent otherwise?
}
