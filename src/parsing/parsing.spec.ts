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

import { replaceTokens, tryParse } from './parsing';

describe('parsing', () => {
  describe('replaceTokens', () => {
    it('works with basic', () => {
      expect(replaceTokens({'type': '%{type}%'}, { type: 'internal' })).toEqual({"type": "internal"});
    });

    it('does not replace keys', () => {
      expect(replaceTokens({'%type%': '%{type}%'}, { type: 'malice' })).toEqual({"%type%": "malice"});
    });

    it('works with nested', () => {
      const obj = {
        "name":"Dealership1",
        "city":"Beijing",
        "oranges": {
          "orange1":"%{orange1}%",
          "orange2":"blood",
          "orange3": {
            "type": "mandarin",
            "brand": "%{brand3}%"
          }
        }
      };

      expect(replaceTokens(obj, { 'orange1': 'navel', 'brand3': 'halo' })).toEqual({
        "city": "Beijing",
        "name": "Dealership1",
        "oranges": {
          "orange1": "navel",
          "orange2": "blood",
          "orange3": {
            "brand": "halo",
            "type": "mandarin"
          }
        }
      });
    });

  });
});
