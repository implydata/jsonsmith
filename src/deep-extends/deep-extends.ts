/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

import { deepSet } from '../object-utils/object-utils';

function deepCloneArray<T>(arr: T[]): T[] {
  const clonedArr: T[] = [];
  arr.forEach((item, i) => {
    if (typeof item === 'object' && item != null) {
      if (Array.isArray(item)) {
        clonedArr[i] = deepCloneArray(item) as any;
      } else {
        clonedArr[i] = deepExtends({}, item);
      }
    } else {
      clonedArr[i] = item;
    }
  });

  return clonedArr;
}

function resolveNewValue(oldVal: any, newVal: any) {
  if (typeof newVal !== 'object' || newVal === null) return newVal;
  if (Array.isArray(newVal)) return deepCloneArray(newVal);
  if (typeof oldVal !== 'object' || oldVal === null || Array.isArray(oldVal)) return deepExtends({}, newVal);
  return deepExtends(oldVal, newVal);
}

export function deepExtends(...args: any[]) {
  if (args.length < 1 || typeof args[0] !== 'object') {
    throw new Error(`Invalid arguments: [${args.toString()}] must provide a list of json values.`);
  }

  let target = args[0];

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
