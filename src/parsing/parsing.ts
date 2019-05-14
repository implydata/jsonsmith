import * as yaml from 'js-yaml';
import * as ini from 'ini';
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
      const yamlResp = yaml.safeLoadAll(fileData);
      if (yamlResp.every(yaml => typeof yaml === 'object')) {
        return yamlResp;
      }
    } catch (e) {
      if (format === 'yaml') {
        throw new Error(`Could not parse yaml: ${e.message}`);
      }
    }
  }

  if (!format || format === 'json') {
    try {
      return JSON.parse(fileData);
    } catch (e) {
      if (format === 'json') {
        throw new Error(`Could not parse json: ${e.message}`);
      }
    }
  }

  if (!format || format === 'properties') {
    try {
      return ini.parse(fileData);
    } catch (e) {
      if (format === 'properties') {
        throw new Error(`Could not parse properties: ${e.message}`);
      }
    }
  }

  throw new Error(`Could not parse: ${fileData}`);
}

