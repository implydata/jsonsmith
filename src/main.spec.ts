import { main } from './main';
import * as fs from 'fs-extra';

describe('main', () => {
  it('works with two configs', async () => {
    const fixedConnectionYaml = 'test/configs/config-fixed-connection.yaml';
    const fileContents = 'fixedConnections.0.name: override';
    await fs.writeFile(fixedConnectionYaml, fileContents);
    const resp: any = await main({
      inputs: [
        'test/configs/config-simple.yaml',
        'test/configs/config-fixed-connection.yaml'
      ]
    });
    expect(resp.fixedConnections[0].name).toEqual('override');
    await fs.remove(fixedConnectionYaml);
  });

  it('works with inline vars', async () => {
    const resp: any = await main({
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

    const resp: any = await main({
      inputs: [
        'test/configs/config-simple.yaml',
        'test/configs/config.properties'
      ]
    });
    expect(resp.userNameLabel).toEqual('myDotPropertiesLabel');
    await fs.remove(dotProperties);
  });

  it('works with yaml documents', async () => {
    const dotProperties = 'test/configs/config.properties';
    const fileContentsProperties = 'userNameLabel=myDotPropertiesLabel';
    await fs.writeFile(dotProperties, fileContentsProperties);

    const documentsYaml = 'test/configs/config-documents.yaml';
    const fileContents = `
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

    await fs.writeFile(documentsYaml, fileContents);

    const resp: any = await main({
      inputs: [
        documentsYaml,
        'test/configs/config.properties'
      ]
    });

    expect(resp).toEqual({
      "tracks": [
        {
          "length": "5:07",
          "title": "Respond/react"
        },
        {
          "length": "4:08",
          "title": "Section"
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
      "userNameLabel": "myDotPropertiesLabel"
    }
    );

    await fs.remove(dotProperties);
    await fs.remove(documentsYaml);
  });
});
