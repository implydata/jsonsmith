# jsonsmith

resolves a series of inputs to a single json value.

## Usage:

`cobble(params: CobbleParams)`


### With file paths
```
import { cobble } from 'jsonsmith
cobble({
  inputs: [
     'someDir/yaml1.yaml',
     'someDir/	yaml2.yaml',
    ]
 });
```
This will do a deep extends with target being the first argument provided, and subsequent arguments as sources.

### With raw inputs
```
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
```
{
  "appName": "app",
  "version": "1.0"
}
```
## Options
`inputs (required)`: a list of inputs where each element can be one of the following:
  - a string representing a file path -- jsonsmith will try to figure out the format if not provided explicitly
  - an object with properties `path` and `format`, where `format` can be one of `json`, `yaml`, and `properties`
  - an object with property `raw` that maps to a value in json, yaml, or .properties format

`varsObj`: an object on which interpolation will be done and passed in as the last input -- use this to pass in environment variables with syntax `%{VARIABLE_NAME}%`


`debug`: a function that takes a string
