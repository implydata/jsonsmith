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

import { cobble } from './cobble';
import * as fs from 'fs-extra';

describe('main', () => {
  it('works with two configs', async () => {
    const fixedConnectionYaml = 'test/configs/config-fixed-connection.yaml';
    const fileContents = 'fixedConnections.0.name: override';
    await fs.writeFile(fixedConnectionYaml, fileContents);
    const resp: any = await cobble({
      inputs: [
        'test/configs/config-simple.yaml',
        'test/configs/config-fixed-connection.yaml'
      ]
    });
    expect(resp.fixedConnections[0].name).toEqual('override');
    await fs.remove(fixedConnectionYaml);
  });

  it('works with inline vars', async () => {
    const resp: any = await cobble({
      inputs: [
        { raw: `{'userNameLabel': 'welcome to %{subdivision}%'}` }
      ],
      varsObj: {subdivision: 'pots and pans'}
    });

    expect(resp.userNameLabel).toEqual('welcome to pots and pans');
  });

  it('works with dot properties', async () => {
    const dotProperties = 'test/configs/config.properties';
    const fileContents = 'userNameLabel=myDotPropertiesLabel';
    await fs.writeFile(dotProperties, fileContents);

    const resp: any = await cobble({
      inputs: [
        'test/configs/config-simple.yaml',
        'test/configs/config.properties'
      ]
    });
    expect(resp.userNameLabel).toEqual('myDotPropertiesLabel');
    await fs.remove(dotProperties);
  });

  it('works with json overrides', async () => {
    const resp: any = await cobble({
      inputs: [
        'test/configs/config-simple.yaml',
        { raw: `{'userMode': 'special-user'}` }
      ]
    });
    expect(resp.userMode).toEqual('special-user');
  });

  it('works with yaml documents', async () => {
    const dotProperties = 'test/configs/config.properties';
    const dotPropertiesContents = 'nest.userNameLabel=myDotPropertiesLabel';
    await fs.writeFile(dotProperties, dotPropertiesContents);

    const documentsYaml = 'test/configs/config-documents.yaml';
    const documentsYamlContents = `
---
# Some songs
tracks:
    - title: Respond/react
      length: '5:07'
    - title: Section
      length: '4:08'
    - title: Panic!!!!!
      length: '1:24'
    - title: It just don't stop
      length: '4:33'
...
---
tracks.2.title: Panic!!!(edited)
...
    `;

    await fs.writeFile(documentsYaml, documentsYamlContents);

    const mixedFile = 'test/configs/config-mixed.yaml';
    const mixedContent = `
---
addendum:
    - title: Outro
      details: |
            '1996'
            A major record deal 
            and some international notoriety
footnote: |
  -----BEGIN FOOTNOTE-----
  Charted only on the Bubbling Under Hot 100 Singles or 
  Bubbling Under R&B/Hip-Hop Singles charts, 25-song extensions to the 
  Billboard Hot 100 and Hot R&B/Hip-Hop Songs charts respectively.
  -----END FOOTNOTE-----
...
---
! some last minute edits
tracks.1.title = Section(edited)
blue = note will
...

`;

    await fs.writeFile(mixedFile, mixedContent);

    const resp: any = await cobble({
      inputs: [
        documentsYaml,
        dotProperties,
        mixedFile
      ],
      debug: console.log
    });

    expect(resp).toEqual({
      "addendum": [
        {
          "details": "'1996'\nA major record deal \nand some international notoriety\n",
          "title": "Outro"
        }
      ],
      "blue": "note will",
      "nest": {
        "userNameLabel": "myDotPropertiesLabel"
      },
      "tracks": [
        {
          "length": "5:07",
          "title": "Respond/react"
        },
        {
          "length": "4:08",
          "title": "Section(edited)"
        },
        {
          "length": "1:24",
          "title": "Panic!!!(edited)"
        },
        {
          "length": "4:33",
          "title": "It just don't stop"
        }
      ],
      "footnote": "-----BEGIN FOOTNOTE-----\nCharted only on the Bubbling Under Hot 100 Singles or \nBubbling Under R&B/Hip-Hop Singles charts, 25-song extensions to the \nBillboard Hot 100 and Hot R&B/Hip-Hop Songs charts respectively.\n-----END FOOTNOTE-----\n",
      }
    );

    await fs.remove(dotProperties);
    await fs.remove(documentsYaml);
    await fs.remove(mixedFile);
  });
});
