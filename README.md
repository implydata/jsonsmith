# jsonsmith

resolves a series of inputs to a single json value.

## Usage:

### `cobble(options)`
`options <Object>` has the following properties:
  
- `inputs (required)`: a list of inputs where each element can be one of the following:
  - a string representing a file path -- jsonsmith will try to figure out the format if not provided explicitly
  - an object with properties `path` and `format`, where `format` can be one of `json`, `yaml`, and `properties`
  - an object with property `raw` that maps to a value in json, yaml, or .properties format

- `varsObj`: an optional object that will be used as the context for [interpolation](#interpolation) will be done and passed in as the last input

- `debug <string>: void`: optional

### Interpolation
  - a value with syntax `%{VARIABLE_NAME}%` will be evaluated in the context of `varsObj`
  - `$read_json(path<string>)` will be interpreted as a file containing json
  `$read_text(path<string>)` and `$read_yaml(path<string>)` are analogues for text and yaml files respectively.

### Examples

#### With file paths
```javascript
import { cobble } from 'jsonsmith'

cobble({
  inputs: [
     'someDir/yaml1.yaml',
     'someDir/yaml2.yaml'
    ]
 });
```
This will do a deep extends with target being the first argument provided, and subsequent arguments as sources.

#### With raw inputs
```javascript
import { cobble } from 'jsonsmith'

cobble({
  inputs: [
    {
      "raw": {
        "version": "0.5",
        "appName": "app"
      }
    },
    {
     "raw": "version=1.0"
    }
  ]
})
```
The above would result in the following object
```json
{
  "appName": "app",
  "version": "1.0"
}
```

#### With interpolation

```javascript
import { cobble } from 'jsonsmith'

cobble({
  inputs: [
    {
     "raw": "template=$read_json('templates/template.json')"
    },
    {
     "raw": "version=%{APP_VERSION}%"
    }
  ],
  varsObj: { APP_VERSION: "1.7" }
})
```

where `templates/template.json` looks like
```json
{
  "name": "Scott Storch",
  "subject": "Mellow my man"
}
```

would result in the following object

```json
{
  "template": {
    "name": "Scott Storch",
    "subject": "Mellow my man"
  },
  "version": "1.7"
}
```
