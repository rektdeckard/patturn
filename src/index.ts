export type Mapper<In, Out> = Out | ((input: In) => Out);

export type MatchBranch<In, Out> =
  | [In, Mapper<In, Out>]
  | [(input: In) => boolean, Mapper<In, Out>];

export type WhenBranch<In> = [
  In | ((input: In) => boolean),
  (input: In) => void
];

export function match<In, Out = In>(
  input: In,
  matchers: Array<MatchBranch<In, Out>>,
  defaultValue?: Out
): Out | undefined {
  for (const [matcher, mapper] of matchers) {
    if (matcher === input) {
      if (typeof mapper === "function") {
        return (mapper as (input: In) => Out)(input);
      } else {
        return mapper;
      }
    }

    if (typeof matcher === "function") {
      if ((matcher as (input: In) => boolean)(input)) {
        if (typeof mapper === "function") {
          return (mapper as (input: In) => Out)(input);
        } else {
          return mapper;
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
  for (const [matcher, op] of matchers) {
    if (matcher === input) {
      op(input);
      if (lazy) return;
    }

    if (typeof matcher === "function") {
      if ((matcher as (input: In) => boolean)(input)) {
        op(input);
        if (lazy) return;
      }
    }
  }
}
