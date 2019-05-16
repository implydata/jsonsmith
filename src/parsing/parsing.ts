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
export type Format = 'json' | 'json-pretty' | 'yaml' | 'properties';

export function inlineVars(obj: any, vs: Record<string, string>): any {
  return JSON.parse(JSON.stringify(obj).replace(/%\{[\w\-]+\}%/g, (varName) => {
    varName = varName.substr(2, varName.length - 4);
    let v = vs[varName];
    if (typeof v !== 'string') throw new Error(`could not find variable '${varName}'`);
    v = JSON.stringify(v);
    return v.substr(1, v.length - 2);
  }));
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

