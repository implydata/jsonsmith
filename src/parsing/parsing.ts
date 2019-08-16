/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as fs from 'fs-extra';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as properties from 'properties';

import { mapRecord } from '../object-utils/object-utils';

export type Format = 'json' | 'yaml' | 'properties';

export function splitYamlIntoDocs(fileData: string): string[] {
  return fileData.split(/^(?:\s*\.\.\.\s*$)|\s*(?:^---)$(?:[^.])?/gm).filter(doc => {
    return doc !== '' && doc != null;
  });
}

export async function resolveFiles(obj: any, currentDir: string): Promise<any> {
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (
        Object.prototype.toString.call(obj[key]) === '[object Object]' ||
        Array.isArray(obj[key])
      ) {
        await resolveFiles(obj[key], currentDir);
      } else {
        const value = obj[key];
        let fileName = '';
        let format = '';
        if (value) {
          const args = String(value).match(/(?:\$read_(text|json|yaml))\((.*)\)/);
          if (args && typeof args[1] === 'string' && typeof args[2] === 'string') {
            format = args[1];
            if (!args[2] || typeof args[2] !== 'string') {
              throw new Error('invalid arguments');
            }

            fileName = path.resolve(currentDir, args[2]);
          }

          if (!fileName) continue;

          let fileData: string;
          try {
            fileData = (await fs.readFile(fileName, 'utf-8')) as string;
          } catch (e) {
            throw new Error(`Could not read file: ${fileName}`);
          }

          switch (format) {
            case 'text':
              obj[key] = fileData;
              break;
            case 'yaml':
              const parsedYaml = await yaml.safeLoad(`${String(key)}: ${fileData}`);
              obj[key] = parsedYaml[key];
              break;
            case 'json':
              obj[key] = JSON.parse(fileData);
              break;
            default:
              throw new Error(`Unsupported format: ${format}`);
          }
        }
      }
    }
  }

  return obj;
}

export function replaceTokens(
  obj: any,
  vs: Record<string, string>,
  ignoreMissingVariables = false,
): any {
  if (Object.prototype.toString.call(obj) === '[object Object]') {
    return mapRecord(obj, v => replaceTokens(v, vs, ignoreMissingVariables));
  } else if (Array.isArray(obj)) {
    return obj.map(element => replaceTokens(element, vs, ignoreMissingVariables));
  } else if (typeof obj === 'string') {
    const matches = obj.match(/%\{[\w-]+(?:\s*\|\|\s*[\w-]+)?\}%/g);
    if (!matches) {
      if (obj.match(/%{.*}%/)) {
        throw new Error(`Tokens must only contain word characters and '-'`);
      }

      return obj;
    }

    for (const token of matches) {
      const unwrapped = token.substr(2, token.length - 4);

      const variables = unwrapped.split(/\s?\|\|\s?/);
      const variable = variables[0];
      if (!variable) {
        throw new Error(`Unexpected variable: ${variable} in token: ${token}`);
      }

      let v: string = vs[variable];
      if (v === undefined) {
        if (variables[1] !== undefined) {
          const fallbackValue = variables[1];
          if (fallbackValue === 'null') return null;
          v = fallbackValue;
        }
      }

      if (v !== undefined) {
        obj = obj.replace(token, v);
      } else {
        if (ignoreMissingVariables) {
          return undefined;
        }

        throw new Error(`could not find variable '${token}'`);
      }
    }
  }

  return obj;
}

export async function tryParse(fileData: string, format?: Format | null) {
  if (!format || format === 'yaml') {
    try {
      const yamlResp = yaml.safeLoad(fileData);
      if (typeof yamlResp === 'object') return yamlResp;
    } catch (e) {
      if (format === 'yaml') {
        throw new Error(`Could not parse yaml: ${e.message}`);
      }
    }
  }

  if (!format || format === 'properties') {
    try {
      return properties.parse(fileData);
    } catch (e) {
      if (format === 'properties') {
        throw new Error(`Could not parse properties: ${e.message}`);
      }
    }
  }

  throw new Error(`Could not parse: ${fileData}`);
}
