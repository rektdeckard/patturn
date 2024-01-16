export type TypeAssert<T> = (input: any) => input is T;

export type ParametricAssert<T, P extends any[] = [value: T]> = (
  ...value: P
) => TypeAssert<T>;

export type Pattern<In> = (input: In) => boolean;

export type Guard<In> =
  | In
  | Guard<In>[]
  | GuardObject<In>
  | DeepPartial<WithExtras<In>>
  | TypeAssert<In>
  | Pattern<In>;

export type GuardAsync<In> =
  | Guard<In>
  | GuardAsync<In>[]
  | GuardObjectAsync<In>
  | Promise<boolean>
  | ((input: In) => Promise<boolean>);

export type GuardObject<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends object ? GuardObject<T[P]> : Guard<T[P]>;
    }
  : T;

export type GuardObjectAsync<T> = T extends object
  ? {
      [P in keyof T]?: T[P] extends object
        ? GuardObjectAsync<T[P]>
        : GuardAsync<T[P]>;
    }
  : T;

export type Return<In, Out> = Out | ((input: In) => Out);

export type ReturnAsync<In, Out> =
  | Return<In, Out>
  | ((input: In) => Promise<Out>);

export type MatchBranch<In, Out> = [Guard<In>, Return<In, Out>];

export type MatchBranchAsync<In, Out> = [GuardAsync<In>, ReturnAsync<In, Out>];

export type WhenBranch<In> = [
  Guard<In>,
  ((input: In) => void) | null | undefined,
];

export type WhenBranchAsync<In> = [
  GuardAsync<In>,
  ((input: In) => void | Promise<void>) | null | undefined,
];

export type DeepPartial<T> = T extends object
  ? {
      [P in keyof T]?: DeepPartial<T[P]>;
    }
  : T;

export type WithExtras<T> = T extends object
  ? { [P in keyof T]: WithExtras<T[P]> } & { [prop: string]: unknown }
  : T;

export type UnionToIntersection<U> = (
  U extends any ? (x: U) => void : never
) extends (x: infer I) => void
  ? I
  : never;
