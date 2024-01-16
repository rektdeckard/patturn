import type { Guard, GuardAsync } from "./types";
import { isFunction } from "./utils";

export function validate<I, O>(guard: Guard<I>) {
  return function (subject: O): boolean {
    let matched = false;

    if (guard === subject) {
      return true;
    } else if (
      isFunction(guard) &&
      (guard as (input: I | O) => boolean)(subject)
    ) {
      matched = true;
    } else if (typeof guard === "object") {
      // Array; process each item recursively
      if (Array.isArray(guard)) {
        for (const g of guard) {
          if (validate(g)(subject)) {
            matched = true;
            break;
          }
        }
      } else if (
        guard !== null &&
        typeof subject === "object" &&
        subject !== null
      ) {
        // Object object; process fields
        let entries = Object.entries(guard);
        return (
          entries.every(([key, value]) => {
            const test = subject[key as keyof typeof subject];
            if (value === test) return true;
            if (typeof value === "function") {
              return value(test);
            }
            if (typeof value === "object" && value !== null) {
              if (Array.isArray(value)) {
                return value.some((v) => validate(v)(test));
              } else {
                return validate(value)(test);
              }
            }

            return false;
          })
        );
      }
    }

    return matched;
  };
}

export function validateAsync<I, O>(guard: GuardAsync<I>) {
  return async function (subject: O): Promise<boolean> {
    let matched = false;

    if (guard === subject) {
      return true;
    } else if (
      isFunction<I | O, Promise<boolean>>(guard) &&
      (await guard(subject))
    ) {
      matched = true;
    } else if (typeof guard === "object") {
      // Array; process each item recursively
      if (Array.isArray(guard)) {
        // TODO: pass in concurrency parameter
        for (const g of guard) {
          if (await validateAsync(g)(subject)) {
            matched = true;
            break;
          }
        }
      } else if (
        guard !== null &&
        typeof subject === "object" &&
        subject !== null
      ) {
        // Object object; process fields
        let entries = Object.entries(guard);
        let entriesAreValid = true;

        for (const [key, value] of entries) {
          const test = subject[key as keyof typeof subject];
          if (value === test) continue;

          if (typeof value === "function") {
            if (!(await value(test))) {
              entriesAreValid = false;
              break;
            }
          } else if (typeof value === "object" && value !== null) {
            if (Array.isArray(value)) {
              const all = await Promise.all(
                value.map((v) => validateAsync(v)(test))
              );
              if (all.some((res) => !res)) {
                entriesAreValid = false;
                break;
              }
            } else {
              const res = await validateAsync(value)(test);
              if (!res) {
                entriesAreValid = false;
                break;
              }
            }
          } else {
            throw new Error(`unimplemented value "${typeof value}" ${value}`);
          }
        }

        return entriesAreValid;
      } else if (guard instanceof Promise) {
        return validateAsync(await guard)(subject);
      } else {
        throw new Error(`unimplemented guard "${typeof guard}" ${guard}`);
      }
    }

    return matched;
  };
}

export function assertValid<I, O>(guard: Guard<I>) {
  const validator = validate<I, O>(guard);
  return function (subject: O) {
    if (!validator(subject)) {
      throw new Error(
        `target ${JSON.stringify(subject)} does not match schema`
      );
    }
  };
}
