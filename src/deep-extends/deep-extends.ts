import { deepSet } from '../object-utils/object-utils';

function deepCloneArray<T>(arr: T[]): T[] {
  const clone: T[] = [];
  arr.forEach((item, i) => {
    if (typeof item === 'object' && item != null) {
      if (Array.isArray(item)) {
        clone[i] = deepCloneArray(item) as any;
      } else {
        clone[i] = deepExtends({}, item);
      }
    } else {
      clone[i] = item;
    }
  });

  return clone;
}

function resolveNewValue(oldVal: any, newVal: any) {
  if (typeof newVal !== 'object' || newVal === null) return newVal;
  if (Array.isArray(newVal)) return deepCloneArray(newVal);
  if (typeof oldVal !== 'object' || oldVal === null || Array.isArray(oldVal)) return deepExtends({}, newVal);
  return deepExtends(oldVal, newVal);
}

export function deepExtends(target: any, ...sources: any[]) {
  const args = Array.prototype.slice.call(arguments);

  if (args.length < 1 || typeof args[0] !== 'object') {
    throw new Error(`Invalid arguments: [${args.toString()}] must provide a list of json values.`);
  }

  if (args.length === 1) return target;

  let newVal: any;
  let previousValue: any;

  args.forEach(function (obj: any) {
    if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
      return; // todo: maybe error here?
    }

    Object.keys(obj).forEach((key) => {
      previousValue = target[key]; // source value
      newVal = obj[key];
      if (newVal === target) {
        return;
      }

      target = deepSet(target, key, resolveNewValue(previousValue, newVal));
    });
  });

  return target;
}
