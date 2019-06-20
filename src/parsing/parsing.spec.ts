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

import { replaceTokens, splitYamlIntoDocs, tryParse } from './parsing';

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
        "fruitPatentRank": null,
        "patentedFruits": [null],
        "oranges": {
          "orange1":"%{orange1}%",
          "orange2":"blood",
          "orange3": {
            "type": "mandarin",
            "brand": "%{brand3}%"
          }
        },
        "appleNames": ['mcintosh', '%{INSERT_YOUR_FAVORITE_APPLE_HERE}%'],
        "appleRegistry": [
          {
            "owner": "Johnny",
            "surname": "Appleseed",
            "ownedApples": "mcintosh"
          },
          {
            "owner": "%{INSERT_YOUR_NAME_HERE}%",
            "surname": "%{INSERT_YOUR_LAST_NAME_HERE}%",
            "ownedApples": "%{INSERT_YOUR_FAVORITE_APPLE_HERE}%"
          }
        ]
      };

      expect(replaceTokens(
        obj,
        {
          'orange1': 'navel',
          'brand3': 'halo',
          'INSERT_YOUR_FAVORITE_APPLE_HERE': 'jazz',
          'INSERT_YOUR_NAME_HERE': 'Atalanta',
          'INSERT_YOUR_LAST_NAME_HERE': 'Melanion'
        }))
        .toEqual({
          "city": "Beijing",
          "name": "Dealership1",
          "oranges": {
            "orange1": "navel",
            "orange2": "blood",
            "orange3": {
              "brand": "halo",
              "type": "mandarin"
            }
          },
          "appleNames": ["mcintosh", "jazz"],
          "appleRegistry": [
            {
              "ownedApples": "mcintosh",
              "owner": "Johnny",
              "surname": "Appleseed"
            },
            {
              "ownedApples": "jazz",
              "owner": "Atalanta",
              "surname": "Melanion"
            }
          ],
          "fruitPatentRank": null,
          "patentedFruits": [null]
      });
    });
  });

  describe('splitYamlIntoDocs', () => {
    const yaml = `---
addendum:
    - title: Outro
      details: |
        '1996'
        A major record deal 
        and some international notoriety
...
---
! some last minute edits
tracks.1.title = Section(edited)
blue = note will
...
---
! final commit edits...
tracks.1.title = Section(edited FINAL)
blues = note will
...
---
! ---final commit edits...
tracks.1.title = Section(edited FINAL)
blues = note will
...
`;
    expect(splitYamlIntoDocs(yaml)).toEqual([
      "addendum:\n    - title: Outro\n      details: |\n        '1996'\n        A major record deal \n        and some international notoriety\n",
      "! some last minute edits\ntracks.1.title = Section(edited)\nblue = note will\n",
      "! final commit edits...\ntracks.1.title = Section(edited FINAL)\nblues = note will\n",
      "! ---final commit edits...\ntracks.1.title = Section(edited FINAL)\nblues = note will\n"
    ]);
  });
});
