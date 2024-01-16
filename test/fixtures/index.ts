export { default as postsJSON } from "./posts.json";

export async function isEvenAsync(num: number): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(num % 2 === 0), 50));
}

export async function isOddAsync(num: number): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(num % 2 !== 0), 50));
}

export async function isFalseAsync(val: boolean): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(!val), 50));
}

export async function doubleAsync(num: number): Promise<number> {
  return new Promise((resolve) => setTimeout(() => resolve(num * 2), 50));
}

export async function delayUppercaseAsync(str: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(str.toUpperCase()), 50)
  );
}

export async function delayIdentityAsync<T>(q: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(q), 50));
}

export async function beautifyAsync(str: string): Promise<string> {
  return new Promise((resolve) =>
    setTimeout(() => resolve(`**~~** ${str} **~~**`), 50)
  );
}

export async function stringMatchesAsync(
  str: string,
  test: string
): Promise<boolean> {
  return new Promise((resolve) => setTimeout(() => resolve(str === test), 100));
}
