export function shallowCopy(v: any): any {
  return Array.isArray(v) ? v.slice() : Object.assign({}, v);
}

function isEmpty(v: any): boolean {
  return !(Array.isArray(v) ? v.length : Object.keys(v).length);
}

export function parsePath(path: string): string[] {
  const parts: string[] = [];
  let rest = path;
  while (rest) {
    const escapedMatch = rest.match(/^\{([^{}]*)\}(?:\.(.*))?$/);
    if (escapedMatch) {
      parts.push(escapedMatch[1]);
      rest = escapedMatch[2];
      continue;
    }

    const normalMatch = rest.match(/^([^.]*)(?:\.(.*))?$/);
    if (normalMatch) {
      parts.push(normalMatch[1]);
      rest = normalMatch[2];
      continue;
    }

    throw new Error(`Could not parse path ${path}`);
  }

  return parts;
}

export function makePath(parts: string[]): string {
  return parts.map(p => p.includes('.') ? `{${p}}` : p).join('.');
}

function isAppend(key: string): boolean {
  return key === '[append]' || key === '-1';
}

export function deepGet<T extends Record<string, any>>(value: T, path: string): any {
  const parts = parsePath(path);
  for (const part of parts) {
    value = ((value || {}) as any)[part];
  }
  return value;
}

export function deepSet<T extends Record<string, any>>(value: T, path: string, x: any): T {
  const parts = parsePath(path);
  let myKey = parts.shift() as string; // Must be defined
  const valueCopy = shallowCopy(value);
  if (Array.isArray(valueCopy) && isAppend(myKey)) myKey = String(valueCopy.length);
  if (parts.length) {
    const nextKey = parts[0];
    const rest = makePath(parts);
    valueCopy[myKey] = deepSet(value[myKey] || (isAppend(nextKey) ? [] : {}), rest, x);
  } else {
    valueCopy[myKey] = x;
  }
  return valueCopy;
}

export function deepDelete<T extends Record<string, any>>(value: T, path: string): T {
  const valueCopy = shallowCopy(value);
  const parts = parsePath(path);
  const firstKey = parts.shift() as string; // Must be defined
  if (parts.length) {
    const firstKeyValue = value[firstKey];
    if (firstKeyValue) {
      const restPath = makePath(parts);
      const prunedFirstKeyValue = deepDelete(value[firstKey], restPath);

      if (isEmpty(prunedFirstKeyValue)) {
        delete valueCopy[firstKey];
      } else {
        valueCopy[firstKey] = prunedFirstKeyValue;
      }
    } else {
      delete valueCopy[firstKey];
    }

  } else {
    if (Array.isArray(valueCopy) && !isNaN(Number(firstKey))) {
      valueCopy.splice(Number(firstKey), 1);
    } else {
      delete valueCopy[firstKey];
    }
  }
  return valueCopy;
}

export function whitelistKeys(obj: Record<string, any>, whitelist: string[]): Record<string, any> {
  const newObj: Record<string, any> = {};
  for (const w of whitelist) {
    if (Object.prototype.hasOwnProperty.call(obj, w)) {
      newObj[w] = obj[w];
    }
  }
  return newObj;
}
