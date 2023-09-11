export function isFunction<I, O>(value: any): value is (i: I) => O {
  return typeof value === "function";
}

// function isReturnFunction<In, Out>(
//   ret: Return<In, Out>
// ): ret is Extract<Return<In, Out>, (...args: any[]) => any> {
//   return typeof ret === "function";
// }
