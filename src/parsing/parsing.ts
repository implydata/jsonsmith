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

import * as properties from 'properties';
import * as yaml from 'js-yaml';
import * as path from 'path';
import * as fs from 'fs-extra';
export type Format = 'json' | 'yaml' | 'properties';


export async function resolveFiles(obj: any): Promise<any> {
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        await resolveFiles(obj[key]);
      } else {
        const value = obj[key];
        let fileName = '';
        let format = '';
        if (value) {
          const args = String(value).match(/(?:\$read_(text|json|yaml))\((.*)\)/);
          if (args && typeof args[1] === 'string' && typeof args[2] === 'string') {
            format = args[1];
            const argsList = args[2].split(', ');
            if (argsList.length !== 2) {
              throw new Error("invalid arguments");
            }

            fileName = path.resolve(argsList[1], argsList[0]);
          }

          if (!fileName) continue;

          let fileData: string | number | Buffer;
          try {
            fileData = await fs.readFile(fileName, 'utf-8');
          } catch (e) {
            throw new Error(`Could not read file: ${fileName}`);
          }

          switch (format) {
            case 'text':
              obj[key] = JSON.stringify(fileData);
              break;
            case 'yaml':
              const parsedYaml = await yaml.safeLoad(`${String(key)}: ${fileData}`);
              obj[key] = parsedYaml[key];
              break;
            case 'json':
              let tuple: any = {};
              tuple[key] = fileData;
              const parsedJSON = JSON.parse(JSON.stringify(tuple));
              obj[key] = parsedJSON[key];
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

export function replaceTokens(obj: any, vs: Record<string, string>): any {
  if (typeof obj === 'object') {
    for (const key in obj) {
      if (Object.prototype.toString.call(obj[key]) === '[object Object]') {
        replaceTokens(obj[key], vs);
      } else {
        if (typeof obj[key] !== 'string') continue;
        const replaced = obj[key].replace(/%{[\w\-]+}%/g, (varName: string) => {
          varName = varName.substr(2, varName.length - 4);
          let v = vs[varName];
          if (typeof v !== 'string') throw new Error(`could not find variable '${varName}'`);
          return v;
        });

        obj[key] = replaced;
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

